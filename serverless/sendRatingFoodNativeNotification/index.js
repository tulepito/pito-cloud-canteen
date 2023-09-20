const { integrationSdk } = require('./utils/sdk');
const { denormalisedResponseEntities, User, Listing } = require('./utils/data');
const { sendNotification } = require('./utils/oneSignal');

const BASE_URL = process.env.CANONICAL_URL;

const createNativeNotification = async ({ notificationParams, sdk }) => {
  const { participantId, foodName, orderId, subOrderDate } = notificationParams;
  const participant = denormalisedResponseEntities(
    await sdk.users.show({
      id: participantId,
    }),
  )[0];
  const participantUser = User(participant);
  const { firstName } = participantUser.getProfile();
  const { oneSignalUserId } = participantUser.getPrivateData();
  const url = `${BASE_URL}/participant/order/${orderId}/?subOrderDate=${subOrderDate}&openRatingModal=true`;

  await sendNotification({
    title: 'Đánh giá ngày ăn',
    content: `🌟 ${firstName} ơi, chấm ${foodName} hôm nay mấy điểm?`,
    url,
    oneSignalUserId,
  });
};

exports.handler = async (_event) => {
  try {
    console.log(
      'Start to run schedule to send food rating native notification...',
    );
    console.log('_event: ', _event);
    const { orderId, participantIds = [], subOrderDate, planId } = _event;
    const planResponse = denormalisedResponseEntities(
      await integrationSdk.listings.show({
        id: planId,
      }),
    )[0];

    const planListing = Listing(planResponse);

    const { orderDetail } = planListing.getMetadata();
    const subOrder = orderDetail[`${subOrderDate}`];
    const { memberOrders, restaurant } = subOrder;

    await Promise.all(
      participantIds.map(async (participantId) => {
        const { foodId } = memberOrders[participantId];
        if (foodId) {
          const { foodName } = restaurant.foodList[foodId];
          await createNativeNotification({
            notificationParams: {
              participantId,
              orderId,
              subOrderDate,
              foodName,
            },
            sdk: integrationSdk,
          });
        }
      }),
    );

    console.log(
      'End to run schedule to send food rating native notification...',
    );
  } catch (error) {
    console.error(
      'Schedule to send food rating native notification error: ',
      error?.data ? error?.data?.errors?.[0] : error,
    );
  }
};
