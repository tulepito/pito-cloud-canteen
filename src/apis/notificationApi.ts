import type { NotificationInvitationParams } from '@services/notifications';
import type { ENotificationType } from '@src/utils/enums';
import type { TObject } from '@src/utils/types';

import { getApi, postApi, putApi } from './configs';

export const fetchNotificationsApi = async () => getApi('/notifications');

export const updateNotificationsApi = async ({
  notificationId,
  updateData,
}: {
  notificationId: string | string[];
  updateData: TObject;
}) => putApi(`/notifications`, { notificationId, updateData });

export const createNotificationApi = async ({
  notificationType,
  notificationParams,
  notifications = [],
}: {
  notificationType?: ENotificationType;
  notificationParams?: NotificationInvitationParams;
  notifications?: {
    type: ENotificationType;
    params: NotificationInvitationParams;
  }[];
}) =>
  postApi(`/notifications`, {
    notificationType,
    notificationParams,
    notifications,
  });
