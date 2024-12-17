import type { NextApiRequest, NextApiResponse } from 'next';

import addMembersToCompanyFn from '@pages/api/apiServices/company/addMembersToCompanyFn.service';
import cookies from '@services/cookie';
import companyChecker from '@services/permissionChecker/company';
import { handleError } from '@services/sdk';

export interface POSTAddMembersBody {
  userIdList: string[];
  noAccountEmailList: string[];
  companyId: string;
  orderId?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { companyId, userIdList, noAccountEmailList, orderId } =
      req.body as POSTAddMembersBody;
    const updatedCompanyAccount = await addMembersToCompanyFn({
      userIdList,
      noAccountEmailList,
      companyId,
      orderId,
    });

    res.json(updatedCompanyAccount);
  } catch (error) {
    handleError(res, error);
  }
};

export default cookies(companyChecker(handler));
