import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { User } from '@utils/data';

const ADMIN_FLEX_ID = process.env.PITO_ADMIN_ID;

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const integrationSdk = getIntegrationSdk();
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
      daySessions = [],
      nutritions = [],
    } = User(response).getMetadata();

    const { systemServiceFeePercentage = 0, systemVATPercentage = 0 } =
      User(response).getPrivateData();

    switch (apiMethod) {
      case HttpMethod.GET:
        res.json({
          menuTypes,
          categories,
          packaging,
          daySessions,
          nutritions,
          systemServiceFeePercentage,
          systemVATPercentage,
        });
        break;

      default:
        break;
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default handler;
