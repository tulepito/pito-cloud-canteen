import type { NextApiRequest, NextApiResponse } from 'next';

import { composeApiCheckers } from '@apis/configs';
import { deleteMemberFromCompanyFn } from '@pages/api/api-utils/deleteMemberFromCompanyFn';
import companyChecker from '@services/permissionChecker/company';
import { handleError } from '@services/sdk';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { memberEmail = '', companyId = '' } = req.body;
    const updatedBookerAccount = await deleteMemberFromCompanyFn({
      memberEmail,
      companyId,
    });
    res.json(updatedBookerAccount);
  } catch (error) {
    handleError(res, error);
  }
};

export default composeApiCheckers(companyChecker)(handler);
