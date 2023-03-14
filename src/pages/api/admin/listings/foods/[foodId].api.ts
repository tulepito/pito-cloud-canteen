import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import {
  updateMenuAfterFoodDeleted,
  updateMenuAfterFoodUpdated,
} from '@pages/api/helpers/foodHelpers';
import cookies from '@services/cookie';
import { denormalisedResponseEntities } from '@services/data';
import adminChecker from '@services/permissionChecker/admin';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { IntegrationListing } from '@src/utils/data';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const integrationSdk = getIntegrationSdk();

    switch (apiMethod) {
      case HttpMethod.GET: {
        const { foodId, JSONParams } = req.query;
        const { dataParams = {}, queryParams = {} } = JSON.parse(
          JSONParams as string,
        );
        const response = await integrationSdk.listings.show(
          { id: foodId, ...dataParams },
          queryParams,
        );

        return res.json(response);
      }

      case HttpMethod.PUT: {
        const { dataParams = {}, queryParams = {} } = req.body;
        const response = await integrationSdk.listings.update(
          dataParams,
          queryParams,
        );

        const [food] = denormalisedResponseEntities(response);

        await updateMenuAfterFoodUpdated(IntegrationListing(food).getId());

        return res.status(200).json(response);
      }

      case HttpMethod.DELETE: {
        const { foodId } = req.query;
        const { queryParams = {} } = req.body;

        const response = await integrationSdk.listings.update(
          {
            id: foodId,
            metadata: {
              isDeleted: true,
            },
          },
          queryParams,
        );

        await updateMenuAfterFoodDeleted(foodId as string);

        return res.status(200).json(response);
      }

      default:
        return res.status(400).json({ message: 'Bad request' });
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(adminChecker(handler));
