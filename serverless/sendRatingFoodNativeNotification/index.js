const { integrationSdk } = require('./utils/sdk');
const { denormalisedResponseEntities, User, Listing } = require('./utils/data');
const { sendNotification } = require('./utils/oneSignal');

const BASE_URL = process.env.CANONICAL_URL;

const buildFullName = (firstName, lastName, compareToGetLongerWith) => {
  if (!firstName || !lastName) return firstName || lastName || '';

  if (firstName === lastName) return firstName;

  const fullName = `${lastName} ${firstName}`;

  if (!compareToGetLongerWith) return fullName;

  if (fullName.length < compareToGetLongerWith.length) {
    return compareToGetLongerWith;
  }

  return fullName;
};

const createNativeNotification = async ({ notificationParams, sdk }) => {
  const { participantId, foodName, orderId, subOrderDate } = notificationParams;
  const participant = denormalisedResponseEntities(
    await sdk.users.show({
      id: participantId,
    }),
  )[0];
  const participantUser = User(participant);
  const { displayName, firstName, lastName } = participantUser.getProfile();
  const { oneSignalUserIds = [] } = participantUser.getPrivateData();
  const { company = {}, isCompany } = participantUser.getMetadata();

  const isBooker = Object.values(company).some(({ permission }) => {
    return permission === 'booker';
  });

  const notSendParticipantNotification = isCompany || isBooker;

  if (notSendParticipantNotification) return;

  if (oneSignalUserIds.length === 0) return;

  const url = `${BASE_URL}/participant/order/${orderId}/?subOrderDate=${subOrderDate}&openRatingModal=true`;

  const fullName = buildFullName(firstName, lastName, displayName);

  await Promise.all(
    oneSignalUserIds.map(async (oneSignalUserId) => {
      await sendNotification({
        title: 'Đánh giá ngày ăn',
        content: `🌟 ${fullName} ơi, chấm ${foodName} hôm nay mấy điểm?`,
        url,
        oneSignalUserId,
      });
    }),
  );
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
