import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import createCompanyGroupFn from '@pages/api/apiServices/company/createCompanyGroupFn.service';
import deleteCompanyGroupFn from '@pages/api/apiServices/company/deleteCompanyGroupFn.service';
import updateCompanyGroupFn from '@pages/api/apiServices/company/updateCompanyGroupFn.service';
import cookies from '@services/cookie';
import companyChecker from '@services/permissionChecker/company';
import { handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { companyId, groupId, groupInfo, groupMembers } = req.body;
  const apiMethod = req.method;

  switch (apiMethod) {
    case HttpMethod.POST: {
      try {
        const updatedCompanyAccount = await createCompanyGroupFn({
          companyId,
          groupInfo,
          groupMembers,
        });

        return res.json(updatedCompanyAccount);
      } catch (error) {
        return handleError(res, error);
      }
    }
    case HttpMethod.PUT: {
      const { addedMembers = [], deletedMembers = [] } = req.body;
      try {
        const updatedCompanyAccount = await updateCompanyGroupFn({
          companyId,
          groupInfo,
          groupId,
          deletedMembers,
          addedMembers,
        });

        return res.status(200).json(updatedCompanyAccount);
      } catch (error) {
        return handleError(res, error);
      }
    }
    case HttpMethod.DELETE: {
      try {
        const updatedCompanyAccount = await deleteCompanyGroupFn({
          companyId,
          groupId,
        });

        return res.status(200).json(updatedCompanyAccount);
      } catch (error) {
        return handleError(res, error);
      }
    }
    default:
      break;
  }
}

export default cookies(companyChecker(handler));
