/* eslint-disable no-console */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import cookies from '@services/cookie';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { denormalisedResponseEntities } from '@utils/data';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { dataParams, queryParams = {} } = req.body;
    const intergrationSdk = getIntegrationSdk();
    const { restaurantId } = dataParams.metadata;

    const restaurantRes = await intergrationSdk.listings.show({
      id: restaurantId,
      include: ['author'],
    });
    const [restaurant] = denormalisedResponseEntities(restaurantRes);
    const response = await intergrationSdk.listings.create(
      {
        ...dataParams,
        state: 'published',
        authorId: restaurant.author.id.uuid,
      },
      queryParams,
    );
    res.json(response);
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(handler);
