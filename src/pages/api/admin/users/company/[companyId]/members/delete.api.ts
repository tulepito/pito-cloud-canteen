import type { NextApiRequest, NextApiResponse } from 'next';

import deleteMemberFromCompanyFn from '@pages/api/apiServices/company/deleteMemberFromCompanyFn.service';
import cookies from '@services/cookie';
import adminChecker from '@services/permissionChecker/admin';
import { handleError } from '@services/sdk';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { companyId } = req.query;
    const { memberEmail } = req.body;
    const updatedCompanyAccount = await deleteMemberFromCompanyFn({
      memberEmail,
      companyId: companyId as string,
    });
    res.json(updatedCompanyAccount);
  } catch (error) {
    handleError(res, error);
  }
};

export default cookies(adminChecker(handler));
