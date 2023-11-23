import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { getSdk, handleError } from '@services/sdk';
import { CurrentUser, denormalisedResponseEntities } from '@src/utils/data';

import { publishOrder } from './publish-order.service';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;

    const sdk = getSdk(req, res);
    const currentUserResponse = await sdk.currentUser.show();
    const [currentUser] = denormalisedResponseEntities(currentUserResponse);
    const { isAdmin = false } = CurrentUser(currentUser).getMetadata();

    switch (apiMethod) {
      case HttpMethod.POST:
        {
          const { orderId } = req.query;

          if (isEmpty(orderId)) {
            res.status(400).json({ error: 'Missing orderId' });

            return;
          }

          await publishOrder(orderId as string, isAdmin);
          res.json({ message: `Successfully publish order ${orderId}` });
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

export default cookies(handler);
