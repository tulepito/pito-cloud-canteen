import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { getSdk, handleError } from '@services/sdk';
import { CompanyPermissions } from '@src/types/UserPermission';
import type { TObject } from '@src/utils/types';
import { CurrentUser, denormalisedResponseEntities } from '@utils/data';

import queryCompanies from './query.service';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const apiMethod = req.method;
  const sdk = getSdk(req, res);

  switch (apiMethod) {
    case HttpMethod.GET: {
      try {
        const currentUserRes = await sdk.currentUser.show();
        const [currentUser] = denormalisedResponseEntities(currentUserRes);
        const { company } = CurrentUser(currentUser).getMetadata();
        const companyIdList = Object.entries(company).reduce<string[]>(
          (result, current) => {
            const [id, permissionMap] = current as [string, TObject];

            return CompanyPermissions.includes(permissionMap?.permission)
              ? result.concat(id)
              : result;
          },
          [],
        );

        const companyList = isEmpty(companyIdList)
          ? []
          : await queryCompanies({ companyIdList });

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
