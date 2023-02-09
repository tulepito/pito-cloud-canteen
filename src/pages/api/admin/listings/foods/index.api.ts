/* eslint-disable no-console */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { denormalisedResponseEntities } from '@utils/data';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const integrationSdk = getIntegrationSdk();

    switch (apiMethod) {
      case HttpMethod.POST:
        {
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
              state: 'published',
              authorId: restaurant.author.id.uuid,
            },
            queryParams,
          );
          res.json(response);
        }
        break;
      case HttpMethod.DELETE:
      case HttpMethod.GET:
      case HttpMethod.PUT:
      default:
        break;
    }
  } catch (error) {
    console.log(error);
    handleError(res, error);
  }
}

export default cookies(handler);
