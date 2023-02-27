import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/integrationSdk';
import { handleError } from '@services/sdk';
import { Listing } from '@utils/data';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const integrationSdk = getIntegrationSdk();

    switch (apiMethod) {
      case HttpMethod.GET:
        break;
      case HttpMethod.POST:
        break;
      case HttpMethod.DELETE:
        {
          const { companyId, orderId } = req.query;
          const [orderListing] = denormalisedResponseEntities(
            await integrationSdk.listings.show({
              id: orderId,
            }),
          );

          const { companyId: orderCompanyId, plans = [] } =
            Listing(orderListing).getMetadata();

          if (companyId !== orderCompanyId) {
            res.status(403).json({
              error: `Order ${orderId} is not belong to company ${companyId}`,
            });
          }

          await Promise.all(
            plans.map(async (planId: string) => {
              await integrationSdk.listings.close({
                id: planId,
              });
            }),
          );

          await integrationSdk.listings.close({
            id: orderId,
          });

          res.status(200).json({
            message: `Successfully delete draft order with ID: ${orderId}`,
          });
        }
        break;
      case HttpMethod.PUT:
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
