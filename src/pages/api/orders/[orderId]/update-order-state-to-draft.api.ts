import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { EBookerOrderDraftStates } from '@src/utils/enums';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;

    switch (apiMethod) {
      case HttpMethod.PUT:
        {
          const integrationSdk = getIntegrationSdk();
          const { orderId } = req.query;

          if (isEmpty(orderId)) {
            return res.status(400).json({ error: 'Missing orderId' });
          }

          await integrationSdk.listings.update({
            id: orderId as string,
            metadata: {
              orderState: EBookerOrderDraftStates.bookerDraft,
            },
          });

          res.json({
            message: `Successfully update order state to draft ${orderId}`,
          });
        }
        break;

      default:
        break;
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default handler;
