import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import updateCompany from '@pages/api/apiServices/company/updateCompany.service';
import cookies from '@services/cookie';
import adminChecker from '@services/permissionChecker/admin';
import { getIntegrationSdk, handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { companyId } = req.query;
    switch (req.method) {
      case HttpMethod.PUT: {
        const { dataParams, queryParams = {} } = req.body;
        const company = await updateCompany(
          { id: companyId, ...dataParams },
          queryParams,
        );

        return res.json(company);
      }
      case HttpMethod.GET: {
        const integrationSdk = getIntegrationSdk();
        const response = await integrationSdk.users.show({
          id: companyId,
          include: ['profileImage'],
        });

        return res.json(response);
      }

      default:
        break;
    }
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(adminChecker(handler));
