import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { fetchUser } from '@services/integrationHelper';
import companyChecker from '@services/permissionChecker/company';
import { handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const apiMethod = req.method;
  switch (apiMethod) {
    case HttpMethod.GET:
      try {
        const { companyId } = req.query;
        const companyAccount = await fetchUser(companyId as string);
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
