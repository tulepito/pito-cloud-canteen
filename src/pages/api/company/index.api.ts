import cookies from '@services/cookie';
import { getIntegrationSdk } from '@services/integrationSdk';
import companyChecker from '@services/permissionChecker/company';
import { handleError } from '@services/sdk';
import { denormalisedResponseEntities } from '@utils/data';
import type { NextApiRequest, NextApiResponse } from 'next';

const { UUID } = require('sharetribe-flex-sdk').types;

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const apiMethod = req.method;
  switch (apiMethod) {
    case 'GET':
      break;
    case 'POST':
      break;
    case 'PUT':
      try {
        const { companyImageId, companyName, companyId } = req.body;
        const integrationSdk = getIntegrationSdk();
        const queryParams = {
          expand: true,
          include: ['profileImage'],
          'fields.image': ['variants.square-small', 'variants.square-small2x'],
        };
        const companyAccountResponse = await integrationSdk.users.updateProfile(
          {
            id: new UUID(companyId),
            ...(companyName ? { displayName: companyName } : {}),
            ...(companyImageId
              ? { profileImageId: new UUID(companyImageId) }
              : {}),
          },
          queryParams,
        );
        const [companyAccount] = denormalisedResponseEntities(
          companyAccountResponse,
        );
        res.status(200).json(companyAccount);
      } catch (error) {
        handleError(res, error);
      }

      break;
    case 'DELETE':
      break;

    default:
      break;
  }
}

export default cookies(companyChecker(handler));
