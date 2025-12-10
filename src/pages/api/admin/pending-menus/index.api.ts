import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/integrationSdk';
import adminChecker from '@services/permissionChecker/admin';
import type { MenuListing, UserListing } from '@src/types';
import { buildFullNameFromProfile } from '@src/utils/emailTemplate/participantOrderPicking';
import { EListingStates, EListingType } from '@src/utils/enums';
import {
  FailedResponse,
  HttpStatus,
  SuccessResponse,
} from '@src/utils/response';
import type { TPagination } from '@src/utils/types';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const apiMethod = req.method;
  switch (apiMethod) {
    case HttpMethod.GET:
      try {
        const { page = 1, perPage = 10 } = JSON.parse(
          req.query.JSONParams as string,
        ) as {
          page: number;
          perPage: number;
        };
        const sdk = getIntegrationSdk();
        const menusResponse = await sdk.listings.query({
          meta_listingType: EListingType.menu,
          meta_isDeleted: false,
          meta_listingState: EListingStates.pendingApproval,
          page,
          perPage,
          include: ['author'],
        });
        const menus = denormalisedResponseEntities(menusResponse);
        const pagination: TPagination = {
          page: Number(page),
          perPage: Number(perPage),
          totalItems: menusResponse.data.meta?.totalItems || 0,
          totalPages: menusResponse.data.meta?.totalPages || 0,
        };
        const formattedMenus = menus.map(
          (menu: MenuListing & { author?: UserListing }) => {
            const restaurantName = buildFullNameFromProfile(
              menu.author?.attributes?.profile,
            );

            return {
              ...menu,
              restaurantName,
            };
          },
        );

        return new SuccessResponse({
          data: formattedMenus,
          pagination,
          message: 'Get pending menus successfully',
        }).send(res);
      } catch (error) {
        console.error(error);

        return new FailedResponse({
          message: 'Get pending menus failed',
        }).send(res);
      }
    default:
      return new FailedResponse({
        status: HttpStatus.BAD_REQUEST,
        message: 'Invalid method',
      }).send(res);
  }
};

export default cookies(adminChecker(handler));
