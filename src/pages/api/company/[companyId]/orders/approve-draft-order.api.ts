/* eslint-disable no-console */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { composeApiCheckers, HttpMethod } from '@apis/configs';
import { denormalisedResponseEntities } from '@services/data';
import companyChecker from '@services/permissionChecker/company';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { Listing } from '@utils/data';
import { EListingStates } from '@utils/enums';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  let errorMsg = '';

  try {
    const apiMethod = req.method;
    const integrationSdk = getIntegrationSdk();

    switch (apiMethod) {
      case HttpMethod.GET:
        break;
      case HttpMethod.POST:
        break;
      case HttpMethod.DELETE:
        break;
      case HttpMethod.PUT:
        {
          errorMsg = 'Approve draft order error';
          const { orderId } = req.query;
          const [orderListing] = denormalisedResponseEntities(
            await integrationSdk.listings.show({ id: orderId }),
          );

          const { state: listingState } = Listing(orderListing).getAttributes();

          if (listingState === EListingStates.pendingApproval) {
            await integrationSdk.listings.approve({
              id: orderId,
            });

            res.status(200).json({
              message: `Successfully approve draft order, order: ${orderId}`,
            });
          }

          res.status(400).json({
            message: `Failed to approve approved order, order: ${orderId}`,
          });
        }
        break;
      default:
        break;
    }
  } catch (error) {
    console.error(`${errorMsg}: `, error);
    handleError(res, error);
  }
}

export default composeApiCheckers(companyChecker)(handler);
