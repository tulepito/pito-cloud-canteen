import { ENotificationType } from '@src/utils/enums';
import type { TObject } from '@src/utils/types';

import {
  addCollectionDoc,
  queryCollectionData,
  updateCollectionDoc,
} from './firebase';

const {
  FIREBASE_NOTIFICATION_COLLECTION_NAME,
  NEXT_PUBLIC_FIREBASE_NOTIFICATION_COLLECTION_NAME,
} = process.env;
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

export type NotificationInvitationParams = TObject &
  RequiredNotificationParams &
  Partial<NotificationParams>;

export const createFirebaseDocNotification = async (
  notificationType: ENotificationType,
  notificationParams: NotificationInvitationParams,
) => {
  const notificationTime = new Date();
  const defaultAttributes = {
    isNew: true,
    notificationType,
    createdAt: notificationTime,
    userId: notificationParams?.userId,
  };

  let data: TObject = { ...defaultAttributes };

  try {
    switch (notificationType) {
      case ENotificationType.INVITATION: {
        const { bookerName, companyId, companyName } = notificationParams;
        data = {
          ...defaultAttributes,
          bookerName,
          companyName,
          relatedLink: `/participant/invitation/${companyId}`,
        };

        break;
      }
      case ENotificationType.COMPANY_JOINED: {
        const { companyName } = notificationParams;
        data = {
          ...data,
          companyName,
        };

        break;
      }
      case ENotificationType.ORDER_PICKING: {
        const { orderTitle, orderId } = notificationParams;
        data = {
          ...data,
          orderTitle,
          orderId,
          relatedLink: `/participant/order/${orderId}`,
        };

        break;
      }
      case ENotificationType.ORDER_DELIVERING: {
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
      case ENotificationType.ORDER_SUCCESS: {
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
      case ENotificationType.ORDER_CANCEL: {
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
      case ENotificationType.ORDER_RATING: {
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
      case ENotificationType.SUB_ORDER_UPDATED: {
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

      case ENotificationType.SUB_ORDER_INPROGRESS: {
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
      case ENotificationType.SUB_ORDER_CANCELED:
      case ENotificationType.SUB_ORDER_DELIVERED:
      case ENotificationType.SUB_ORDER_DELIVERING: {
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

      case ENotificationType.SUB_ORDER_REVIEWED_BY_BOOKER: {
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

      case ENotificationType.SUB_ORDER_REVIEWED_BY_PARTICIPANT: {
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

    await addCollectionDoc(
      data,
      NEXT_PUBLIC_FIREBASE_NOTIFICATION_COLLECTION_NAME! ||
        FIREBASE_NOTIFICATION_COLLECTION_NAME!,
    );
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
      limitRecords: 100,
    });
    console.debug(
      '💫 > file: notifications.ts:177 > fetchFirebaseDocNotifications > notifications: ',
      notifications,
    );

    return notifications;
  } catch (error) {
    console.error('Error fetching notifications for user: ', userId);
    console.error('Error fetching notifications: ', error);
  }
};

export const updateSeenFirebaseDocNotification = async (
  notificationId: string,
  data: TObject,
) => {
  try {
    await updateCollectionDoc(
      notificationId,
      data,
      FIREBASE_NOTIFICATION_COLLECTION_NAME!,
    );
  } catch (error) {
    console.error('Error update notification: ', notificationId);
    console.error('Error update notification: ', error);
  }
};
