const { addCollectionDoc } = require('./helper');
const { NOTIFICATION_TYPES } = require('./config');
const config = require('../../utils/config');

const createFirebaseDocNotification = async (
  notificationType,
  notificationParams,
) => {
  const notificationTime = new Date();
  const defaultAttributes = {
    isNew: true,
    notificationType,
    createdAt: notificationTime,
    userId: notificationParams?.userId,
  };

  let data = { ...defaultAttributes };

  try {
    switch (notificationType) {
      case NOTIFICATION_TYPES.PARTICIPANT_AUTO_PICK_FOOD: {
        const { orderTitle, orderId } = notificationParams;
        data = {
          ...data,
          orderTitle,
          orderId,
          relatedLink: `/participant/order/${orderId}`,
        };
        break;
      }

      default:
        break;
    }

    await addCollectionDoc(data, config.firebase.notificationCollectionName);
  } catch (error) {
    console.error('Error notification type: ', notificationType);
    console.error('Error creating notification: ', error);
  }
};

module.exports = { createFirebaseDocNotification };
