import cookies from '@services/cookie';
import adminChecker from '@services/permissionChecker/admin';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { denormalisedResponseEntities } from '@utils/data';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { dataParams, queryParams = {} } = req.body;
    const integrationSdk = getIntegrationSdk();
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
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(adminChecker(handler));
