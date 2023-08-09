import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import {
  fetchFirebaseDocNotifications,
  updateSeenFirebaseDocNotification,
} from '@services/notifications';
import participantChecker from '@services/permissionChecker/participant';
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

        res.json(notificationsResponse);
        break;
      }

      case HttpMethod.POST: {
        const { notificationId } = req.body;
        await updateSeenFirebaseDocNotification(notificationId, {
          seen: true,
        });
        res.status(200).end();
        break;
      }

      default:
        break;
    }
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(participantChecker(handler));
