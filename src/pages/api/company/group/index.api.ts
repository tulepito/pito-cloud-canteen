import type { NextApiRequest, NextApiResponse } from 'next';

import { createCompanyGroupFn } from '@pages/api/api-utils/createCompanyGroupFn';
import { deleteCompanyGroupFn } from '@pages/api/api-utils/deleteCompanyGroupFn';
import { updateCompanyGroupFn } from '@pages/api/api-utils/updateCompanyGroupFn';
import { HTTP_METHODS } from '@pages/api/helpers/constants';
import cookies from '@services/cookie';
import companyChecker from '@services/permissionChecker/company';
import { handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { companyId, groupId, groupInfo, groupMembers } = req.body;
  const apiMethod = req.method;
  switch (apiMethod) {
    case HTTP_METHODS.POST: {
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
    case HTTP_METHODS.PUT: {
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
    case HTTP_METHODS.DELETE: {
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
