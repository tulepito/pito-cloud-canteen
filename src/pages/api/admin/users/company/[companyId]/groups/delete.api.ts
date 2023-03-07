import type { NextApiRequest, NextApiResponse } from 'next';

import { deleteCompanyGroupFn } from '@pages/api/api-utils/deleteCompanyGroupFn';
import cookies from '@services/cookie';
import adminChecker from '@services/permissionChecker/admin';
import { handleError } from '@services/sdk';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { companyId } = req.query;
    const { groupId } = req.body;
    const updatedCompanyAccount = await deleteCompanyGroupFn({
      companyId: companyId as string,
      groupId,
    });

    res.json(updatedCompanyAccount);
  } catch (error) {
    handleError(res, error);
  }
};

export default cookies(adminChecker(handler));
