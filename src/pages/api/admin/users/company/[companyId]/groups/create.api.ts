import { createCompanyGroupFn } from '@pages/api/api-utils/createCompanyGroupFn';
import cookies from '@services/cookie';
import adminChecker from '@services/permissionChecker/admin';
import { handleError } from '@services/sdk';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { companyId } = req.query;
    const { groupInfo, groupMembers } = req.body;

    const updatedCompanyAccount = await createCompanyGroupFn({
      groupInfo,
      groupMembers,
      companyId: companyId as string,
    });
    res.json(updatedCompanyAccount);
  } catch (error) {
    handleError(res, error);
  }
};

export default cookies(adminChecker(handler));
