const { fetchUser } = require('../../../utils/integrationHelper');
const { User, Listing } = require('../../../utils/data');
const { sendNotification } = require('./oneSignal');
const { ENativeNotificationType } = require('./config');

const BASE_URL = process.CANONICAL_URL;

const formatTimestamp = (date) => {
  const jsDate = new Date(Number(date));

  return `${jsDate.getDate()}/${jsDate.getMonth() + 1}`;
};

const sendNativeNotification = async (notificationType, notificationParams) => {
  const { participantId } = notificationParams;
  const participant = await fetchUser(participantId);
  const participantUser = User(participant);
  const { firstName } = participantUser.getProfile();
  const { oneSignalUserIds = [] } = participantUser.getPrivateData();

  if (oneSignalUserIds.length === 0) return;

  switch (notificationType) {
    case ENativeNotificationType.BookerTransitOrderStateToInProgress:
      {
        const { order } = notificationParams;
        const orderListing = Listing(order);
        const orderId = orderListing.getId();
        const { startDate, endDate } = orderListing.getMetadata();
        const url = `${BASE_URL}/participant/order/${orderId}/?subOrderDate=${startDate}&viewMode=week`;

        oneSignalUserIds.forEach((oneSignalUserId) => {
          sendNotification({
            title: 'Tuần ăn đã đặt',
            content: `Tuần ăn ${formatTimestamp(+startDate)}-${formatTimestamp(
              +endDate,
            )} của ${firstName} được đặt thành công`,
            url,
            oneSignalUserId,
          });
        });
      }
      break;

    default:
      break;
  }
};

module.exports = { sendNativeNotification };
