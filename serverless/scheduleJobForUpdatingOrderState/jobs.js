const { OrderStates } = require('./utils/constants');
const { denormalisedResponseEntities } = require('./utils/data');
const { integrationSdk } = require('./utils/sdk');

const completeOrder = async (orderId) => {
  console.info('Start to complete order: ', orderId);

  const [orderListing] = denormalisedResponseEntities(
    await integrationSdk.listings.show({
      id: orderId,
    }),
  );

  const { orderState, orderStateHistory = [] } =
    orderListing?.attributes?.metadata || {};

  if (orderState !== OrderStates.inProgress) {
    console.error('Order is not in progress, skip complete order');

    return;
  }

  await integrationSdk.listings.update({
    id: orderId,
    metadata: {
      orderState: OrderStates.pendingPayment,
      orderStateHistory: orderStateHistory.concat({
        state: OrderStates.pendingPayment,
        updatedAt: new Date().getTime(),
      }),
    },
  });

  console.info('Complete order successfully, orderId: ', orderId);
};

module.exports = { completeOrder };
