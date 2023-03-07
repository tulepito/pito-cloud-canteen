import type { NextApiRequest, NextApiResponse } from 'next';

import { updateCompanyGroupFn } from '@pages/api/api-utils/updateCompanyGroupFn';
import cookies from '@services/cookie';
import adminChecker from '@services/permissionChecker/admin';
import { handleError } from '@services/sdk';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { companyId } = req.query;
    const {
      addedMembers = [],
      deletedMembers = [],
      groupInfo,
      groupId,
    } = req.body;
    const updatedCompanyAccount = await updateCompanyGroupFn({
      companyId: companyId as string,
      groupInfo,
      groupId,
      deletedMembers,
      addedMembers,
    });

    res.json(updatedCompanyAccount);
  } catch (error) {
    handleError(res, error);
  }
};

export default cookies(adminChecker(handler));
