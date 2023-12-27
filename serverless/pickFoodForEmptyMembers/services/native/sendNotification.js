const get = require('lodash/get');
const { sendNotification } = require('./oneSignal');
const { NATIVE_NOTIFICATION_TYPES } = require('./config');
const config = require('../../utils/config');

const BASE_URL = config.canonicalRootURL;

const formatTimestamp = (date) => {
  const jsDate = new Date(Number(date));

  return `${jsDate.getDate()}/${jsDate.getMonth() + 1}`;
};

const sendNativeNotification = async (notificationType, notificationParams) => {
  const { participant } = notificationParams;

  const { oneSignalUserIds = [] } = get(
    participant,
    'attributes.privateData',
    {},
  );

  if (oneSignalUserIds.length === 0) return;

  switch (notificationType) {
    case NATIVE_NOTIFICATION_TYPES.ParticipantAutoPickFood:
      {
        const { planId, startDate, deadlineDate, deadlineHour } =
          notificationParams;
        const url = `${BASE_URL}/participant/orders/?planId=${planId}&timestamp=${startDate}&viewMode=week`;

        oneSignalUserIds.forEach((oneSignalUserId) => {
          sendNotification({
            title: 'PITO đã chọn món giúp bạn',
            content: `Hình như bạn đã quên chọn món, PITO đã chọn giúp bạn. Bạn vẫn có thể chọn lại món trước ${deadlineHour} ${formatTimestamp(
              +deadlineDate,
              'dd/MM/yyyy',
            )}`,
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
