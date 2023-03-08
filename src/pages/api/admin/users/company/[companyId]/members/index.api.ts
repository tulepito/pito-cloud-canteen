// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

import queryCompanyMembers from '@pages/api/apiServices/company/queryCompanyMembers.service';
import cookies from '@services/cookie';
import adminChecker from '@services/permissionChecker/admin';
import { handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { companyId } = req.query;
    const members = await queryCompanyMembers(companyId as string);
    return res.json(members);
  } catch (error) {
    return handleError(res, error);
  }
}

export default cookies(adminChecker(handler));
