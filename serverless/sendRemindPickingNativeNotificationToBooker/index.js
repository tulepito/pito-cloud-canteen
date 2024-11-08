const { integrationSdk } = require('./utils/sdk');
const { denormalisedResponseEntities, User, Listing } = require('./utils/data');
const { sendNotification } = require('./utils/oneSignal');

const BASE_URL = process.env.CANONICAL_URL;

const createNativeNotification = async ({ notificationParams, sdk }) => {
  const { bookerId, orderId } = notificationParams;
  const booker = denormalisedResponseEntities(
    await sdk.users.show({
      id: bookerId,
    }),
  )[0];
  const bookerUser = User(booker);
  const { displayName } = bookerUser.getProfile();
  const { oneSignalUserIds = [] } = bookerUser.getPrivateData();
  const url = `${BASE_URL}/company/orders/${orderId}/picking?userRole=booker`;

  await Promise.all(
    oneSignalUserIds.map(async (oneSignalUserId) => {
      await sendNotification({
        title: 'Sắp hết hạn chọn món ⏰',
        content: `${displayName} ơi, sắp hết hạn chọn món. Hãy nhắc thành viên tham gia đặt cơm ngay nhé.`,
        url,
        oneSignalUserId,
      });
    }),
  );
};

exports.handler = async (_event) => {
  try {
    console.log(
      'Start to run schedule to send picking native notification to booker...',
    );
    console.log('_event: ', _event);
    const { orderId } = _event;
    const order = denormalisedResponseEntities(
      await integrationSdk.listings.show({
        id: orderId,
      }),
    )[0];
    const orderListing = Listing(order);
    const { bookerId, orderState } = orderListing.getMetadata();
    if (orderState !== 'picking') {
      console.log('Order state is not picking, skip to send notification');

      return;
    }
    await createNativeNotification({
      notificationParams: {
        bookerId,
        orderId,
      },
      sdk: integrationSdk,
    });

    console.log(
      'End to run schedule to send picking native notification to booker...',
    );
  } catch (error) {
    console.error(
      'Schedule to send picking native notification to booker error: ',
      error?.data ? error?.data?.errors?.[0] : error,
    );
  }
};
