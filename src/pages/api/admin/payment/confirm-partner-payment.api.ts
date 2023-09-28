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
  const { planId, subOrderDate } = req.body;
  const integrationSdk = getIntegrationSdk();

  try {
    switch (apiMethod) {
      case HttpMethod.PUT: {
        const [plan] = denormalisedResponseEntities(
          await integrationSdk.listings.show({
            id: planId,
          }),
        );

        const { orderDetail = {} } = Listing(plan).getMetadata();

        const { isAdminPaymentConfirmed = false } =
          orderDetail[subOrderDate] || {};

        if (isAdminPaymentConfirmed) {
          return res.status(EHttpStatusCode.BadRequest).json({
            error: 'Cannot confirm partner payment confirmed order',
          });
        }

        const updateOrderDetail = {
          ...orderDetail,
          [subOrderDate]: {
            ...orderDetail[subOrderDate],
            isAdminPaymentConfirmed: true,
          },
        };

        denormalisedResponseEntities(
          await integrationSdk.listings.update({
            id: planId,
            metadata: {
              orderDetail: updateOrderDetail,
            },
          }),
        );

        return res.status(EHttpStatusCode.Ok).json({
          message: 'Successfully confirm partner payment',
          orderDetail: updateOrderDetail,
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
