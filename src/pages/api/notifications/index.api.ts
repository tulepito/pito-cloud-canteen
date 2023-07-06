import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import {
  createFirebaseDocNotification,
  fetchFirebaseDocNotifications,
  updateSeenFirebaseDocNotification,
} from '@services/notifications';
import { getSdk, handleError } from '@services/sdk';
import { denormalisedResponseEntities } from '@src/utils/data';
import type { TObject } from '@src/utils/types';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { method } = req;
  try {
    switch (method) {
      case HttpMethod.GET: {
        const sdk = getSdk(req, res);
        const [currentUser] = denormalisedResponseEntities(
          await sdk.currentUser.show(),
        );
        const notificationsResponse = await fetchFirebaseDocNotifications(
          currentUser.id.uuid,
        );

        return res.status(200).json(notificationsResponse);
      }

      case HttpMethod.PUT: {
        const { notificationIds, updateData } = req.body;

        notificationIds.map((id: string) => {
          return updateSeenFirebaseDocNotification(id, updateData);
        });

        return res.status(200).json({
          message: `Updated ${notificationIds.join(', ')}`,
        });
      }

      case HttpMethod.POST: {
        const { notificationType, notificationParams, notifications } =
          req.body;

        if (!isEmpty(notifications)) {
          await Promise.all(
            notifications.map(async ({ type, params }: TObject) => {
              await createFirebaseDocNotification(type, params);
            }),
          );
        } else {
          await createFirebaseDocNotification(
            notificationType,
            notificationParams,
          );
        }

        return res.status(200).json({
          message: `Created notification(s)`,
        });
      }

      case HttpMethod.POST: {
        const { notificationType, notificationParams, notifications } =
          req.body;

        if (!isEmpty(notifications)) {
          await Promise.all(
            notifications.map(async ({ type, params }: TObject) => {
              await createFirebaseDocNotification(type, params);
            }),
          );
        } else {
          await createFirebaseDocNotification(
            notificationType,
            notificationParams,
          );
        }

        return res.status(200).json({
          message: `Created notification(s)`,
        });
      }

      default:
        break;
    }
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(handler);
