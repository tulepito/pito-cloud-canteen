const { NATIVE_NOTIFICATION_TYPES } = require('./native/config');
const { sendNativeNotification } = require('./native/sendNotification');

const sendStartOrderNativeNotification = async ({ booker, order }) => {
  await sendNativeNotification(NATIVE_NOTIFICATION_TYPES.AdminStartOrder, {
    booker,
    order,
  });
};

module.exports = { sendStartOrderNativeNotification };
