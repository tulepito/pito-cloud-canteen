// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

import queryMembersByEmail from '@pages/api/apiServices/company/queryMembersByEmail.service';
import cookies from '@services/cookie';
import adminChecker from '@services/permissionChecker/admin';
import { handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { JSONParams } = req.query as unknown as {
      JSONParams: string;
    };
    const { dataParams = {}, queryParams = {} } = JSON.parse(JSONParams);
    const { emails } = dataParams;
    const { users, noExistedUsers } = await queryMembersByEmail(
      emails,
      queryParams,
    );

    return res.status(200).json({ users, noExistedUsers });
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(adminChecker(handler));
