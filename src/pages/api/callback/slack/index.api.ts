import type { NextApiRequest, NextApiResponse } from 'next';

import logger from '@helpers/logger';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { ESlackNotificationType } from '@src/utils/enums';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { challenge, event } = req.body as {
      challenge: string;
      event?: {
        ts: string;
        metadata?: {
          event_type: string;
          event_payload: {
            plan_id?: string;
            rating_id?: string;
          };
        };
      };
    };
    logger.info('Slack body:', JSON.stringify(req.body));
    const integrationSdk = getIntegrationSdk();

    const eventType = event?.metadata?.event_type;

    if (!eventType) return res.status(200).json({ challenge });

    switch (eventType) {
      case ESlackNotificationType.ORDER_STATUS_CHANGES_TO_IN_PROGRESS:
        {
          const planId = event?.metadata?.event_payload.plan_id;

          integrationSdk.listings.update({
            id: planId,
            metadata: {
              slackThreadTs: event?.ts,
            },
          });
        }
        break;

      case ESlackNotificationType.PARTICIPANT_RATING:
        {
          const ratingId = event?.metadata?.event_payload.rating_id;

          integrationSdk.listings.update({
            id: ratingId,
            metadata: {
              slackThreadTs: event?.ts,
            },
          });
        }
        break;

      default:
        break;
    }

    return res.status(200).json({ challenge });
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default handler;
