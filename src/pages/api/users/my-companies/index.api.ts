import { HTTP_METHODS } from '@pages/api/helpers/constants';
import cookies from '@services/cookie';
import { getSdk, handleError } from '@services/sdk';
import { CurrentUser, denormalisedResponseEntities } from '@utils/data';
import type { NextApiRequest, NextApiResponse } from 'next';

import queryCompanies from './query.service';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const apiMethod = req.method;
  const sdk = getSdk(req, res);

  switch (apiMethod) {
    case HTTP_METHODS.GET: {
      try {
        const currentUserRes = await sdk.currentUser.show();
        const [currentUser] = denormalisedResponseEntities(currentUserRes);
        const { companyList: companyIdList } =
          CurrentUser(currentUser).getMetadata();

        const companyList = await queryCompanies({ companyIdList });

        return res.status(200).json(companyList);
      } catch (error) {
        handleError(res, error);
      }
      break;
    }
    default:
      break;
  }
};
export default cookies(handler);
