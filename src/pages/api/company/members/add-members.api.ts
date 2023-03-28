import type { NextApiRequest, NextApiResponse } from 'next';

import addMembersToCompanyFn from '@pages/api/apiServices/company/addMembersToCompanyFn.service';
import cookies from '@services/cookie';
import companyChecker from '@services/permissionChecker/company';
import { handleError } from '@services/sdk';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { companyId, userIdList, noAccountEmailList } = req.body;
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
