const isEmpty = require('lodash/isEmpty');
const uniq = require('lodash/uniq');

const { startOrder } = require('./services/startOrder');
const { initiatePayment } = require('./services/initiatePayment');
const { initiateTransaction } = require('./services/initiateTransaction');
const { initiateQuotation } = require('./services/initiateQuotation');
const { cancelAllSubOrderTxs } = require('./services/cancelAllSubOrderTxs');
const { cancelPickingOrder } = require('./services/cancelPickingOrder');
const { getEditedSubOrders } = require('./services/helpers/transaction');
const { getSystemAttributes } = require('./services/helpers/attributes');
const { emailSendingFactory } = require('./services/awsSES/sendEmail');
const { EmailTemplateTypes } = require('./services/awsSES/config');

const { denormalisedResponseEntities, Listing } = require('./utils/data');
const getIntegrationSdk = require('./utils/integrationSdk');
const {
  isEnableToCancelOrder,
  checkIsOrderHasInProgressState,
  groupFoodOrderByDate,
} = require('./services/helpers/order');
const { ORDER_STATES, ORDER_TYPES } = require('./utils/enums');

exports.handler = async (_event) => {
  // const handler = async (_event) => {
  try {
    console.info('Start to run schedule to start order ...');
    const { orderId } = _event;
    console.info('💫 > orderId: ', orderId);

    if (isEmpty(orderId)) {
      console.error('Missing orderId');

      return;
    }

    const integrationSdk = getIntegrationSdk();

    const [orderListing] = denormalisedResponseEntities(
      await integrationSdk.listings.show({
        id: orderId,
      }),
    );
    console.info('💫 > orderListing: ');
    console.info(orderListing);

    const {
      orderState,
      orderStateHistory,
      orderType,
      companyId,
      plans = [],
    } = Listing(orderListing).getMetadata();
    const planId = plans[0];
    const isGroupOrder = orderType === ORDER_TYPES.group;

    if (isEmpty(planId)) {
      console.error('Missing planId');

      return;
    }

    if (orderState !== ORDER_STATES.picking) {
      console.error('💫 > Cannot start non-picking order');

      return;
    }

    const [planListing] = denormalisedResponseEntities(
      await integrationSdk.listings.show({
        id: planId,
      }),
    );
    console.info('💫 > planListing: ');
    console.info(planListing);
    const { orderDetail = {} } = Listing(planListing).getMetadata();
    console.info('💫 > orderDetail: ');
    console.info(orderDetail);

    // TODO: check condition to cancel order
    const shouldCancelOrder = isEnableToCancelOrder(orderDetail);
    console.info('💫 > shouldCancelOrder: ', shouldCancelOrder);
    const editedSubOrders = getEditedSubOrders(orderDetail);
    console.info('💫 > editedSubOrders: ');
    console.info(editedSubOrders);
    const { systemVATPercentage = 0 } = await getSystemAttributes();
    console.info('💫 > systemVATPercentage: ', systemVATPercentage);

    if (shouldCancelOrder) {
      if (
        checkIsOrderHasInProgressState(orderStateHistory) &&
        !isEmpty(editedSubOrders)
      ) {
        console.info('💫 > orderStateHistory: ', orderStateHistory);
        console.info('💫 > canceling all sub order transactions');
        await cancelAllSubOrderTxs({ planId, orderDetail, integrationSdk });
        console.info('💫 > canceled all sub order transactions');
      }

      console.info('💫 > canceling order');
      await cancelPickingOrder(orderId, orderListing);
      console.info('💫 > canceled order');
    } else {
      console.info('💫 > starting order');
      await startOrder({ orderListing, orderDetail, systemVATPercentage });
      console.info('💫 > started order');

      console.info('💫 > initiate transactions');
      await initiateTransaction({ orderId, orderListing, planId, planListing });
      console.info('💫 > initiated transactions');

      const [newOrderListing] = denormalisedResponseEntities(
        await integrationSdk.listings.show({
          id: orderId,
        }),
      );
      console.info('💫 > new orderListing: ', newOrderListing);

      console.info('💫 > initiate quotation for order');
      const quotationListing = await initiateQuotation(
        orderId,
        companyId,
        groupFoodOrderByDate({ orderDetail, isGroupOrder }),
      );
      console.info('💫 > initiated quotation');

      console.info('💫 > initiate payments for order');
      await initiatePayment({
        orderListing: newOrderListing,
        planListing,
        quotationListing,
        systemVATPercentage,
      });
      console.info('💫 > initiated payments');

      const { partner = {} } = Listing(quotationListing).getMetadata();
      console.info('💫 > notifying partners');
      uniq(Object.keys(partner)).forEach(async (restaurantId) => {
        await emailSendingFactory(
          EmailTemplateTypes.PARTNER.PARTNER_NEW_ORDER_APPEAR,
          {
            orderId,
            restaurantId,
          },
        );
      });
      console.info('💫 > notified partners');
    }
  } catch (error) {
    console.error('Schedule automatic start order error');

    if (error.status && error.statusText && error.data) {
      const { status, statusText, data } = error;

      console.error({
        name: 'Local API request failed',
        status,
        statusText,
      });
      console.error(data);
    } else {
      console.error(error?.message);
    }
  }
};
