import { deleteMemberFromCompanyFn } from '@pages/api/api-utils/deleteMemberFromCompanyFn';
import cookies from '@services/cookie';
import adminChecker from '@services/permissionChecker/admin';
import { handleError } from '@services/sdk';
import type { NextApiRequest, NextApiResponse } from 'next';

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
