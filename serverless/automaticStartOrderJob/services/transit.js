const isEmpty = require('lodash/isEmpty');
const { DateTime } = require('luxon');
const omit = require('lodash/omit');

const {
  Listing,
  Transaction,
  denormalisedResponseEntities,
} = require('../utils/data');
const { emailSendingFactory } = require('./awsSES/sendEmail');
const { sendNativeNotification } = require('./native/sendNotification');
const { NATIVE_NOTIFICATION_TYPES } = require('./native/config');
const { NOTIFICATION_TYPES } = require('./firebase/config');
const {
  createFirebaseDocNotification,
} = require('./firebase/createNotification');
const { EmailTemplateTypes } = require('./awsSES/config');
const { VNTimezone } = require('./helpers/date');
const {
  modifyPaymentWhenCancelSubOrder,
} = require('./helpers/modifyPaymentWhenCancelSubOrder');
const { transitionOrderStatus } = require('./helpers/transitionOrderStatus');
const { TRANSITIONS } = require('../utils/enums');
const { fetchListing } = require('../utils/integrationHelper');
const { getIntegrationSdk } = require('../utils/integrationSdk');
const { createQuotation } = require('./createQuotation');

const transit = async (txId, transition) => {
  try {
    const integrationSdk = getIntegrationSdk();

    if (isEmpty(txId) || isEmpty(transition)) {
      throw new Error('Missing transaction ID or transition');
    }

    if (!TRANSITIONS[transition]) {
      throw new Error(`Invalid transition: ${transition}`);
    }

    const txResponse = await integrationSdk.transactions.transition(
      {
        id: txId,
        transition,
        params: {},
      },
      { expand: true, include: ['booking', 'listing', 'provider'] },
    );

    const tx = denormalisedResponseEntities(txResponse)[0];
    const txGetter = Transaction(tx);
    const {
      participantIds = [],
      orderId,
      anonymous = [],
    } = txGetter.getMetadata();
    const { booking, listing } = txGetter.getFullData();
    const listingGetter = Listing(listing);
    const restaurantId = listingGetter.getId();
    const { displayStart } = booking.attributes;
    const timestamp = new Date(displayStart).getTime();
    const startTimestamp = DateTime.fromMillis(timestamp)
      .setZone(VNTimezone)
      .startOf('day')
      .toMillis();
    const order = await fetchListing(orderId);
    const orderListing = Listing(order);
    const { plans = [], quotationId, companyId } = orderListing.getMetadata();
    const { title: orderTitle } = orderListing.getAttributes();
    const generalNotificationData = {
      orderId,
      orderTitle,
      planId: plans[0],
      subOrderDate: startTimestamp,
    };
    const plan = await fetchListing(plans[0]);
    const planListing = Listing(plan);
    const planId = planListing.getId();

    const { orderDetail = {} } = planListing.getMetadata();
    const { memberOrders = {} } = orderDetail[startTimestamp];

    const updatePlanListing = async (lastTransition) => {
      const newOrderDetail = {
        ...orderDetail,
        [startTimestamp]: {
          ...orderDetail[startTimestamp],
          lastTransition,
        },
      };

      await integrationSdk.listings.update({
        id: planId,
        metadata: {
          orderDetail: newOrderDetail,
        },
      });
    };

    switch (transition) {
      case TRANSITIONS.OPERATOR_CANCEL_PLAN:
      case TRANSITIONS.OPERATOR_CANCEL_AFTER_PARTNER_CONFIRMED:
      case TRANSITIONS.OPERATOR_CANCEL_AFTER_PARTNER_REJECTED: {
        // TODO:  send email notification to booker
        emailSendingFactory(
          EmailTemplateTypes.BOOKER.BOOKER_SUB_ORDER_CANCELED,
          {
            orderId,
            timestamp,
          },
        );
        // TODO: send email notification to participants and create native notifications
        [...participantIds, ...anonymous].forEach((participantId) => {
          const { foodId } = memberOrders[participantId] || {};
          if (foodId) {
            emailSendingFactory(
              EmailTemplateTypes.PARTICIPANT.PARTICIPANT_SUB_ORDER_CANCELED,
              {
                orderId,
                timestamp,
                participantId,
              },
            );
            sendNativeNotification(
              NATIVE_NOTIFICATION_TYPES.AdminTransitSubOrderToCanceled,
              {
                participantId,
                planId,
                subOrderDate: startTimestamp.toString(),
              },
            );
          }
        });

        // Function is not ready on production
        if (process.ALLOW_PARTNER_EMAIL_SEND === 'true') {
          // TODO: send email notifications to partners
          emailSendingFactory(
            EmailTemplateTypes.PARTNER.PARTNER_SUB_ORDER_CANCELED,
            {
              orderId,
              timestamp,
              restaurantId,
            },
          );
        }
        // TODO: create firebase notifications
        [...participantIds, ...anonymous].map(async (participantId) => {
          createFirebaseDocNotification(NOTIFICATION_TYPES.ORDER_CANCEL, {
            ...generalNotificationData,
            userId: participantId,
          });
        });

        // TODO: create new quotation
        const quotation = await fetchListing(quotationId);
        const quotationListing = Listing(quotation);
        const { client, partner } = quotationListing.getMetadata();
        const newClient = {
          ...client,
          quotation: omit(client.quotation, [`${startTimestamp}`]),
        };

        const newPartner = {
          ...partner,
          [restaurantId]: {
            ...partner[restaurantId],
            quotation: omit(partner[restaurantId].quotation, [
              `${startTimestamp}`,
            ]),
          },
        };
        integrationSdk.listings.update({
          id: quotationId,
          metadata: {
            status: 'inactive',
          },
        });
        createQuotation({
          orderId,
          companyId,
          client: newClient,
          partner: newPartner,
        });
        // TODO: update all payments records
        await Promise.all([
          modifyPaymentWhenCancelSubOrder({
            order,
            subOrderDate: startTimestamp,
            clientQuotation: newClient,
            partnerQuotation: newPartner,
          }),
          transitionOrderStatus(order, plan, integrationSdk),
        ]);
        break;
      }

      default:
        break;
    }

    await updatePlanListing(transition);

    console.info({
      message: 'Successfully transit transaction',
    });
  } catch (error) {
    console.error(error);

    throw new Error(error);
  }
};

module.exports = { transit };
