import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { EListingStates } from '@src/utils/enums';
import { denormalisedResponseEntities } from '@utils/data';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const integrationSdk = getIntegrationSdk();

    switch (apiMethod) {
      case HttpMethod.POST: {
        const { dataParams, queryParams = {} } = req.body;
        const { restaurantId } = dataParams.metadata;

        const restaurantRes = await integrationSdk.listings.show({
          id: restaurantId,
          include: ['author'],
        });
        const [restaurant] = denormalisedResponseEntities(restaurantRes);
        const response = await integrationSdk.listings.create(
          {
            ...dataParams,
            state: EListingStates.published,
            authorId: restaurant?.author?.id?.uuid,
          },
          queryParams,
        );

        return res.status(200).json(response);
      }
      default:
        return res.status(400).json({ message: 'Bad request' });
    }
  } catch (error) {
    console.log(error);
    handleError(res, error);
  }
}

export default cookies(handler);
