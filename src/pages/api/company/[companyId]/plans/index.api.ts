import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import logger from '@helpers/logger';
import cookies from '@services/cookie';
import { handleError } from '@services/sdk';
import {
  queryListings,
  showCurrentUser,
  showUserById,
} from '@services/sdkHelper';
import { CurrentUser, User } from '@src/utils/data';
import { ECompanyPermission, EListingType } from '@src/utils/enums';
import type { TCurrentUser, TUser } from '@src/utils/types';

const isBookerOrOwner = (currentUser: TCurrentUser, companyUser: TUser) => {
  const currentUserId = CurrentUser(currentUser).getId();

  const { members = {} } = User(companyUser).getMetadata();

  return Object.keys(members).find((member) => {
    const { permission, id } = members[member];

    if (id === currentUserId) {
      return (
        permission === ECompanyPermission.booker ||
        permission === ECompanyPermission.owner
      );
    }

    return false;
  });
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;

    switch (apiMethod) {
      case HttpMethod.GET: {
        const { companyId, JSONParams } = req.query;
        const { dataParams = {}, queryParams = {} } = JSON.parse(
          JSONParams as string,
        );

        if (!companyId) throw new Error('companyId is required');

        const [{ currentUser }, { user: companyUser }] = await Promise.all([
          showCurrentUser(req, res),
          showUserById(req, res, companyId as string),
        ]);

        if (!isBookerOrOwner(currentUser, companyUser))
          throw new Error('You are not booker or owner');

        const { listings } = await queryListings(
          req,
          res,
          {
            ...dataParams,
            meta_listingType: EListingType.subOrder,
          },
          queryParams,
        );

        return res.status(200).json(listings);
      }
      case HttpMethod.POST:
      case HttpMethod.DELETE:
      case HttpMethod.PUT:
      default:
        return res.status(405).end();
    }
  } catch (error) {
    logger.error('Error in company plans', String(error));
    handleError(res, error);
  }
}

export default cookies(handler);
