import type { NextApiRequest, NextApiResponse } from 'next';

import { updateMemberPermissionFn } from '@pages/api/api-utils/updateMemberPermissionFn';
import cookies from '@services/cookie';
import adminChecker from '@services/permissionChecker/admin';
import { handleError } from '@services/sdk';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { companyId } = req.query;
    const { memberEmail, permission } = req.body;
    const company = updateMemberPermissionFn({
      companyId: companyId as string,
      memberEmail,
      permission,
    });
    return res.status(200).json(company);
  } catch (error) {
    return handleError(res, error);
  }
};

export default cookies(adminChecker(handler));
