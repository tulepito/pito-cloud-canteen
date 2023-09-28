import type { NextApiRequest, NextApiResponse } from 'next';

import { composeApiCheckers, HttpMethod } from '@apis/configs';
import { EHttpStatusCode } from '@apis/errors';
import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/integrationSdk';
import adminChecker from '@services/permissionChecker/admin';
import { handleError } from '@services/sdk';
import { Listing } from '@src/utils/data';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const apiMethod = req.method;
  const { orderId } = req.body;
  const integrationSdk = getIntegrationSdk();

  try {
    switch (apiMethod) {
      case HttpMethod.PUT: {
        const [orderListing] = denormalisedResponseEntities(
          await integrationSdk.listings.show({
            id: orderId,
          }),
        );

        const { isClientSufficientPaid = false } =
          Listing(orderListing).getMetadata();

        if (isClientSufficientPaid) {
          return res.status(EHttpStatusCode.BadRequest).json({
            error: 'Cannot confirm client payment confirmed order',
          });
        }

        const [updateOrderListing] = denormalisedResponseEntities(
          await integrationSdk.listings.update(
            {
              id: orderId,
              metadata: {
                isClientSufficientPaid: true,
              },
            },
            {
              expand: true,
            },
          ),
        );

        return res.status(EHttpStatusCode.Ok).json({
          message: 'Successfully confirm client payment',
          order: updateOrderListing,
        });
      }
      default:
        break;
    }
  } catch (error) {
    handleError(res, error);
  }
}

export default composeApiCheckers(adminChecker)(handler);
