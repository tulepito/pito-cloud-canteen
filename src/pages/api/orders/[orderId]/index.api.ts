import cookies from '@services/cookie';
import { getIntegrationSdk } from '@services/integrationSdk';
import { handleError } from '@services/sdk';
import { denormalisedResponseEntities } from '@utils/data';
import get from 'lodash/get';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const integrationSdk = getIntegrationSdk();

  const apiMethod = req.method;
  switch (apiMethod) {
    case 'GET':
      try {
        const { orderId } = req.query;

        const orderResponse = await integrationSdk.listings.show({
          id: orderId,
        });
        const orderListing = denormalisedResponseEntities(orderResponse)[0];
        const plans = get(orderListing, 'attributes.metadata.plans', []);

        if (plans?.length > 0) {
          const planId = plans[0];
          const [planListing] = denormalisedResponseEntities(
            await integrationSdk.listings.show({
              id: planId,
            }),
          );

          res.json({ orderListing, planListing });
        } else {
          res.json({ data: orderListing });
        }
      } catch (error) {
        handleError(res, error);
      }
      break;
    case 'POST':
      break;
    case 'PUT':
      break;
    case 'DELETE':
      break;
    default:
      break;
  }
}

export default cookies(handler);
