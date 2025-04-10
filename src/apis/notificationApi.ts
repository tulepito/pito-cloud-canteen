import type { NotificationInvitationParams } from '@services/notifications';
import type { ENotificationType } from '@src/utils/enums';
import type { TObject } from '@src/utils/types';

import { getDedupApi, postApi, putApi } from './configs';

export const fetchNotificationsApi = async () => getDedupApi('/notifications/');

export const updateNotificationsApi = async ({
  notificationIds,
  updateData,
}: {
  notificationIds: string[];
  updateData: TObject;
}) => putApi(`/notifications`, { notificationIds, updateData });

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
