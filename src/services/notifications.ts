import { randomUUID } from 'crypto';

import { ENotificationType } from '@src/utils/enums';

import {
  queryCollectionData,
  setCollectionDocWithCustomId,
  updateCollectionDoc,
} from './firebase';

const { FIREBASE_NOTIFICATION_COLLECTION_NAME } = process.env;

type RequiredNotificationParams = {
  userId: string;
};

type NotificationParams = {
  bookerName: string;
  companyName: string;
  orderTitle: string;
  subOrderDate: number;
  foodName: string;
  companyId: string;
  orderId: string;
  planId: string;
  seen: boolean;
};

type NotificationInvitationParams = RequiredNotificationParams &
  Partial<NotificationParams>;

export const createFirebaseDocNotification = async (
  notificationType: ENotificationType,
  notificationParams: NotificationInvitationParams,
) => {
  const notificationTime = new Date();
  const notificationId = randomUUID();
  try {
    switch (notificationType) {
      case ENotificationType.INVITATION: {
        const { bookerName, companyId, userId, companyName } =
          notificationParams;
        const data = {
          notificationType,
          bookerName,
          companyName,
          relatedLink: `/participant/invitation/${companyId}`,
          userId,
          createdAt: notificationTime,
        };

        await setCollectionDocWithCustomId(
          notificationId,
          data,
          FIREBASE_NOTIFICATION_COLLECTION_NAME!,
        );
        break;
      }
      case ENotificationType.COMPANY_JOINED: {
        const { companyName, userId } = notificationParams;
        const data = {
          notificationType,
          userId,
          companyName,
          createdAt: notificationTime,
        };

        await setCollectionDocWithCustomId(
          notificationId,
          data,
          FIREBASE_NOTIFICATION_COLLECTION_NAME!,
        );
        break;
      }
      case ENotificationType.ORDER_PICKING: {
        const { orderTitle, orderId, userId } = notificationParams;
        const data = {
          notificationType,
          userId,
          orderTitle,
          orderId,
          relatedLink: `/participant/order/${orderId}`,
          createdAt: notificationTime,
        };

        await setCollectionDocWithCustomId(
          notificationId,
          data,
          FIREBASE_NOTIFICATION_COLLECTION_NAME!,
        );
        break;
      }
      case ENotificationType.ORDER_DELIVERING: {
        const { orderTitle, orderId, userId, planId, subOrderDate } =
          notificationParams;
        const data = {
          notificationType,
          userId,
          orderTitle,
          orderId,
          subOrderDate,
          planId,
          relatedLink: `/participant/orders?planId=${planId}&timestamp=${subOrderDate}`,
          createdAt: notificationTime,
        };

        await setCollectionDocWithCustomId(
          notificationId,
          data,
          FIREBASE_NOTIFICATION_COLLECTION_NAME!,
        );
        break;
      }
      case ENotificationType.ORDER_SUCCESS: {
        const { orderTitle, orderId, userId, planId, subOrderDate } =
          notificationParams;
        const data = {
          notificationType,
          userId,
          orderTitle,
          orderId,
          subOrderDate,
          planId,
          relatedLink: `/participant/orders?planId=${planId}&timestamp=${subOrderDate}`,
          createdAt: notificationTime,
        };

        await setCollectionDocWithCustomId(
          notificationId,
          data,
          FIREBASE_NOTIFICATION_COLLECTION_NAME!,
        );
        break;
      }
      case ENotificationType.ORDER_CANCEL: {
        const { orderTitle, orderId, userId, planId, subOrderDate } =
          notificationParams;
        const data = {
          notificationType,
          userId,
          orderTitle,
          orderId,
          subOrderDate,
          planId,
          relatedLink: `/participant/orders?planId=${planId}&timestamp=${subOrderDate}`,
          createdAt: notificationTime,
        };

        await setCollectionDocWithCustomId(
          notificationId,
          data,
          FIREBASE_NOTIFICATION_COLLECTION_NAME!,
        );
        break;
      }
      case ENotificationType.ORDER_RATING: {
        const { userId, planId, subOrderDate, foodName } = notificationParams;
        const data = {
          notificationType,
          userId,
          subOrderDate,
          planId,
          foodName,
          relatedLink: `/participant/sub-orders?planId=${planId}&timestamp=${subOrderDate}`,
          createdAt: notificationTime,
        };

        await setCollectionDocWithCustomId(
          notificationId,
          data,
          FIREBASE_NOTIFICATION_COLLECTION_NAME!,
        );
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error('Error notification type: ', notificationType);
    console.error('Error creating notification: ', error);
  }
};

export const fetchFirebaseDocNotifications = async (userId: string) => {
  try {
    const notifications = await queryCollectionData({
      collectionName: FIREBASE_NOTIFICATION_COLLECTION_NAME!,
      queryParams: {
        userId: {
          operator: '==',
          value: userId,
        },
      },
      limitRecords: 30,
    });

    return notifications;
  } catch (error) {
    console.error('Error fetching notifications for user: ', userId);
    console.error('Error fetching notifications: ', error);
  }
};

export const updateSeenFirebaseDocNotification = async (
  notificationId: string,
) => {
  try {
    await updateCollectionDoc(
      notificationId,
      { seen: true },
      FIREBASE_NOTIFICATION_COLLECTION_NAME!,
    );
  } catch (error) {
    console.error(
      'Error fetching notifications for notificationId: ',
      notificationId,
    );
    console.error('Error fetching notifications: ', error);
  }
};
