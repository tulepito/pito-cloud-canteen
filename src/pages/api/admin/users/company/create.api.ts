import type { NextApiRequest, NextApiResponse } from 'next';

import createCompany from '@pages/api/apiServices/company/createCompany.service';
import cookies from '@services/cookie';
import adminChecker from '@services/permissionChecker/admin';
import { handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { dataParams, queryParams = {} } = req.body;

    const company = await createCompany({ req, res, dataParams, queryParams });

    res.json(company);
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(adminChecker(handler));
