import cookies from '@services/cookie';
import { getIntegrationSdk } from '@services/integrationSdk';
import companyChecker from '@services/permissionChecker/company';
import { handleError } from '@services/sdk';
import { denormalisedResponseEntities } from '@utils/data';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const apiMethod = req.method;
  switch (apiMethod) {
    case 'PUT':
      try {
        const { dataParams, queryParams } = req.body;
        const integrationSdk = getIntegrationSdk();
        const companyAccountResponse = await integrationSdk.users.updateProfile(
          dataParams,
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

    default:
      break;
  }
}

export default cookies(companyChecker(handler));
