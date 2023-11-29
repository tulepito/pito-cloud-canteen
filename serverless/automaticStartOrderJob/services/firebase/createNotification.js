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
      case NOTIFICATION_TYPES.ORDER_PICKING: {
        const { orderTitle, orderId } = notificationParams;
        data = {
          ...data,
          orderTitle,
          orderId,
          relatedLink: `/participant/order/${orderId}`,
        };

        break;
      }
      case NOTIFICATION_TYPES.ORDER_DELIVERING: {
        const { orderTitle, orderId, planId, subOrderDate } =
          notificationParams;
        data = {
          ...data,
          orderTitle,
          orderId,
          subOrderDate,
          planId,
          relatedLink: `/participant/orders?planId=${planId}&timestamp=${subOrderDate}`,
        };

        break;
      }
      case NOTIFICATION_TYPES.ORDER_SUCCESS: {
        const { orderTitle, orderId, planId, subOrderDate } =
          notificationParams;
        data = {
          ...data,
          orderTitle,
          orderId,
          subOrderDate,
          planId,
          relatedLink: `/participant/orders?planId=${planId}&timestamp=${subOrderDate}`,
        };

        break;
      }
      case NOTIFICATION_TYPES.ORDER_CANCEL: {
        const { orderTitle, orderId, planId, subOrderDate } =
          notificationParams;
        data = {
          ...data,
          orderTitle,
          orderId,
          subOrderDate,
          planId,
          relatedLink: `/participant/orders?planId=${planId}&timestamp=${subOrderDate}`,
        };

        break;
      }
      case NOTIFICATION_TYPES.ORDER_RATING: {
        const { planId, subOrderDate, foodName } = notificationParams;
        data = {
          ...data,
          subOrderDate,
          planId,
          foodName,
          relatedLink: `/participant/sub-orders?planId=${planId}&timestamp=${subOrderDate}`,
        };

        break;
      }
      case NOTIFICATION_TYPES.SUB_ORDER_UPDATED: {
        const {
          planId,
          subOrderDate,
          orderId,
          oldOrderDetail,
          newOrderDetail,
          companyName,
          orderTitle,
        } = notificationParams;
        data = {
          ...data,
          subOrderDate,
          orderId,
          planId,
          oldOrderDetail,
          newOrderDetail,
          companyName,
          orderTitle,
          relatedLink: `/partner/orders/${orderId}_${subOrderDate}`,
        };

        break;
      }

      case NOTIFICATION_TYPES.SUB_ORDER_INPROGRESS: {
        const { planId, transition, subOrderDate, orderId, subOrderName } =
          notificationParams;
        data = {
          ...data,
          transition,
          subOrderDate,
          orderId,
          planId,
          subOrderName,
          relatedLink: `/partner/orders/${orderId}_${subOrderDate}`,
        };

        break;
      }
      case NOTIFICATION_TYPES.SUB_ORDER_CANCELED:
      case NOTIFICATION_TYPES.SUB_ORDER_DELIVERED:
      case NOTIFICATION_TYPES.SUB_ORDER_DELIVERING: {
        const { planId, transition, subOrderDate, orderId, companyName } =
          notificationParams;
        data = {
          ...data,
          transition,
          subOrderDate,
          orderId,
          planId,
          companyName,
          relatedLink: `/partner/orders/${orderId}_${subOrderDate}`,
        };

        break;
      }

      case NOTIFICATION_TYPES.SUB_ORDER_REVIEWED_BY_BOOKER: {
        const { reviewerId, subOrderDate, orderId, companyName } =
          notificationParams;
        data = {
          ...data,
          reviewerId,
          subOrderDate,
          orderId,
          companyName,
          relatedLink: `/partner/orders/${orderId}_${subOrderDate}`,
        };

        break;
      }

      case NOTIFICATION_TYPES.SUB_ORDER_REVIEWED_BY_PARTICIPANT: {
        const { reviewerId, subOrderDate, orderId, companyName } =
          notificationParams;
        data = {
          ...data,
          reviewerId,
          subOrderDate,
          orderId,
          companyName,
          relatedLink: `/partner/orders/${orderId}_${subOrderDate}`,
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
