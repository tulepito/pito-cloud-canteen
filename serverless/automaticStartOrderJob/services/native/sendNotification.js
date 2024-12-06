const { fetchUser } = require('../../utils/integrationHelper');
const { User, Listing } = require('../../utils/data');
const { sendNotification } = require('./oneSignal');
const { NATIVE_NOTIFICATION_TYPES } = require('./config');
const config = require('../../utils/config');
const { getFullName } = require('../../utils/string');

const BASE_URL = config.canonicalRootURL;

const formatTimestamp = (date) => {
  const jsDate = new Date(Number(date));

  return `${jsDate.getDate()}/${jsDate.getMonth() + 1}`;
};

const sendNativeNotification = async (notificationType, notificationParams) => {
  const { participantId } = notificationParams;
  const participant = await fetchUser(participantId);
  const participantUser = User(participant);
  const profile = participantUser.getProfile();

  const fullName = getFullName(profile);
  const { oneSignalUserIds = [] } = participantUser.getPrivateData();

  if (oneSignalUserIds.length === 0) return;

  switch (notificationType) {
    case NATIVE_NOTIFICATION_TYPES.AdminTransitSubOrderToCanceled:
      {
        const { planId, subOrderDate } = notificationParams;
        const url = `${BASE_URL}/participant/orders/?planId=${planId}&timestamp=${subOrderDate}&viewMode=week`;

        oneSignalUserIds.forEach((oneSignalUserId) => {
          sendNotification({
            title: 'Opps! Ngày ăn bị hủy!',
            content: `😢 ${fullName} ơi, rất tiếc phải thông báo ngày ăn ${formatTimestamp(
              +subOrderDate,
              'dd/MM',
            )} đã bị hủy`,
            url,
            oneSignalUserId,
          });
        });
      }
      break;

    case NATIVE_NOTIFICATION_TYPES.BookerTransitOrderStateToInProgress:
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
            )} của ${fullName} được đặt thành công`,
            url,
            oneSignalUserId,
          });
        });
      }
      break;

    case NATIVE_NOTIFICATION_TYPES.TransitOrderStateToCanceled:
      {
        const { order, planId } = notificationParams;
        const orderListing = Listing(order);
        const { startDate, endDate } = orderListing.getMetadata();
        const url = `${BASE_URL}/participant/orders/?planId=${planId}&timestamp=${startDate}&viewMode=week`;

        oneSignalUserIds.forEach((oneSignalUserId) => {
          sendNotification({
            title: 'Opps! Tuần ăn bị hủy!',
            content: `😢 ${fullName} ơi, rất tiếc phải thông báo tuần ăn ${formatTimestamp(
              +startDate,
              'dd/MM',
            )}-${formatTimestamp(+endDate, 'dd/MM')} đã bị hủy`,
            url,
            oneSignalUserId,
          });
        });
      }
      break;

    case NATIVE_NOTIFICATION_TYPES.AdminStartOrder:
      {
        const { order } = notificationParams;
        const orderListing = Listing(order);
        const orderId = orderListing.getId();
        const { startDate, endDate } = orderListing.getMetadata();

        const url = `${BASE_URL}/company/orders/${orderId}`;

        oneSignalUserIds.forEach((oneSignalUserId) => {
          sendNotification({
            title: `Tuần ăn đã đặt 🌟`,
            content: `Tuần ăn ${formatTimestamp(
              startDate,
              'dd/MM',
            )} -${formatTimestamp(endDate, 'dd/MM')} đã được đặt thành công.`,
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
