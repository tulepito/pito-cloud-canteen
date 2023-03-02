// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import cookies from '@services/cookie';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { denormalisedResponseEntities, User } from '@utils/data';
import type { NextApiRequest, NextApiResponse } from 'next';

const ADMIN_FLEX_ID = process.env.PITO_ADMIN_ID;
async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const integrationSdk = getIntegrationSdk();
  try {
    const response = denormalisedResponseEntities(
      await integrationSdk.users.show(
        {
          id: ADMIN_FLEX_ID,
        },
        { expand: true },
      ),
    )[0];
    const {
      menuTypes = [],
      categories = [],
      packaging = [],
    } = User(response).getMetadata();
    res.json({
      menuTypes,
      categories,
      packaging,
    });
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(handler);
