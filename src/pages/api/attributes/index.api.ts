import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookie from '@services/cookie';
import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk, getSdk, handleError } from '@services/sdk';
import { CurrentUser, User } from '@utils/data';

const ADMIN_FLEX_ID = process.env.PITO_ADMIN_ID;

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;

    const sdk = getSdk(req, res);
    const currentUserResponse = await sdk.currentUser.show();
    const [currentUser] = denormalisedResponseEntities(currentUserResponse);
    const { isAdmin = false } = CurrentUser(currentUser).getMetadata();

    const integrationSdk = getIntegrationSdk();
    const response = denormalisedResponseEntities(
      await integrationSdk.users.show({
        id: ADMIN_FLEX_ID,
      }),
    )[0];
    const {
      menuTypes = [],
      categories = [],
      packaging = [],
      daySessions = [],
      nutritions = [],
      deliveryPeople = [],
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
          ...(isAdmin ? { deliveryPeople } : {}),
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

export default cookie(handler);
