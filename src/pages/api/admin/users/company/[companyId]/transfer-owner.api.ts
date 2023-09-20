import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import transferCompanyOwner from '@pages/api/apiServices/company/transferCompanyOwner.service';
import cookies from '@services/cookie';
import adminChecker from '@services/permissionChecker/admin';
import { handleError } from '@services/sdk';
import type { UserPermission } from '@src/types/UserPermission';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    console.log('[API-REQUEST]: transfer-owner.api.ts');
    if (req.method !== HttpMethod.POST) return res.status(405).end();

    const { companyId } = req.query;
    const { newOwnerEmail, permissionForOldOwner, newOwnerProfileImageId } =
      req.body;

    const newCompany = await transferCompanyOwner({
      res,
      companyId: companyId as string,
      newOwnerEmail: newOwnerEmail as string,
      permissionForOldOwner: permissionForOldOwner as UserPermission,
      newOwnerProfileImageId,
    });

    return res.status(200).json(newCompany);
  } catch (error) {
    console.error('[API-ERROR]: transfer-owner.api.ts', error);

    return handleError(res, error);
  }
};

export default cookies(adminChecker(handler));
