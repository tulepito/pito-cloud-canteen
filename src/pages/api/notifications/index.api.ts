import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import {
  fetchFirebaseDocNotifications,
  updateSeenFirebaseDocNotification,
} from '@services/notifications';
import { getSdk, handleError } from '@services/sdk';
import { denormalisedResponseEntities } from '@src/utils/data';

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
        const { notificationId, updateData } = req.body;
        const shouldUpdateAnArray = Array.isArray(notificationId);

        if (shouldUpdateAnArray) {
          notificationId.map((id) => {
            return updateSeenFirebaseDocNotification(id, updateData);
          });
        } else {
          updateSeenFirebaseDocNotification(notificationId, updateData);
        }

        return res.status(200).json({
          message: `Updated ${
            shouldUpdateAnArray ? notificationId.join(', ') : notificationId
          }`,
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
