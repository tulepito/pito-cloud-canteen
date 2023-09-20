import type { NextApiRequest, NextApiResponse } from 'next';

import updateMemberPermissionFn from '@pages/api/apiServices/company/updateMemberPermissionFn.service';
import cookies from '@services/cookie';
import adminChecker from '@services/permissionChecker/admin';
import { handleError } from '@services/sdk';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    console.log('[API-REQUEST]: update-permission.api.ts');
    const { companyId } = req.query;
    const { memberEmail, permission } = req.body;
    const company = await updateMemberPermissionFn({
      companyId: companyId as string,
      memberEmail,
      permission,
    });

    return res.status(200).json(company);
  } catch (error) {
    console.error('[API-ERROR]: update-permission.api.ts', error);

    return handleError(res, error);
  }
};

export default cookies(adminChecker(handler));
