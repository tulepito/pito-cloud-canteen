import type { NextApiRequest, NextApiResponse } from 'next';

import addMembersToCompanyFn from '@pages/api/apiServices/company/addMembersToCompanyFn.service';
import cookies from '@services/cookie';
import adminChecker from '@services/permissionChecker/admin';
import { handleError } from '@services/sdk';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { companyId } = req.query;
    const { userIdList, noAccountEmailList } = req.body;

    const updatedCompanyAccount = await addMembersToCompanyFn({
      userIdList,
      noAccountEmailList,
      companyId: companyId as string,
    });
    res.json(updatedCompanyAccount);
  } catch (error) {
    handleError(res, error);
  }
};

export default cookies(adminChecker(handler));
