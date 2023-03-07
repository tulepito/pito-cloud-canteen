import type { NextApiRequest, NextApiResponse } from 'next';

import addMembersToCompanyFn from '@pages/api/api-utils/addMembersToCompanyFn';
import cookies from '@services/cookie';
import companyChecker from '@services/permissionChecker/company';
import { handleError } from '@services/sdk';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { dataParams } = req.body;
    const { companyId, userIdList, noAccountEmailList } = dataParams;
    const updatedCompanyAccount = await addMembersToCompanyFn({
      userIdList,
      noAccountEmailList,
      companyId,
    });
    res.json(updatedCompanyAccount);
  } catch (error) {
    handleError(res, error);
  }
};

export default cookies(companyChecker(handler));
