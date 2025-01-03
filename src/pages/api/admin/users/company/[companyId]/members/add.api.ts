import type { NextApiRequest, NextApiResponse } from 'next';

import addMembersToCompanyFn from '@pages/api/apiServices/company/addMembersToCompanyFn.service';
import cookies from '@services/cookie';
import adminChecker from '@services/permissionChecker/admin';
import { getSdk, handleError } from '@services/sdk';
import { CurrentUser, denormalisedResponseEntities } from '@src/utils/data';
import { buildFullName } from '@src/utils/emailTemplate/participantOrderPicking';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { companyId } = req.query;
    const { userIdList, noAccountEmailList } = req.body;
    const sdk = getSdk(req, res);
    const [currentUser] = denormalisedResponseEntities(
      await sdk.currentUser.show(),
    );

    const currentUserGetter = CurrentUser(currentUser);
    const { firstName, lastName, displayName } = currentUserGetter.getProfile();
    const bookerName = buildFullName(firstName, lastName, {
      compareToGetLongerWith: displayName,
    });

    const updatedCompanyAccount = await addMembersToCompanyFn({
      userIdList,
      noAccountEmailList,
      companyId: companyId as string,
      bookerName,
    });
    res.json(updatedCompanyAccount);
  } catch (error) {
    handleError(res, error);
  }
};

export default cookies(adminChecker(handler));
