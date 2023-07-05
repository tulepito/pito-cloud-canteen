import type { TObject } from '@src/utils/types';

import { getApi, putApi } from './configs';

export const fetchNotificationsApi = async () => getApi('/notifications');

export const updateNotificationsApi = async ({
  notificationId,
  updateData,
}: {
  notificationId: string | string[];
  updateData: TObject;
}) => putApi(`/notifications`, { notificationId, updateData });
