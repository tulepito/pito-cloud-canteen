import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { queryAllPages } from '@helpers/apiHelpers';
import { isUserABookerOrOwner } from '@helpers/user';
import cookies from '@services/cookie';
import { getIntegrationSdk } from '@services/integrationSdk';
import adminChecker from '@services/permissionChecker/admin';
import { handleError } from '@services/sdk';
import type { UserListing } from '@src/types';
import { buildFullName } from '@src/utils/emailTemplate/participantOrderPicking';
import { EListingType, EMenuType } from '@src/utils/enums';

const TIME_FROM = new Date('12/31/2023');
const TIME_TO = new Date('12/31/2024');

type ToolType = 'change-end-date-in-bulk' | 'fetch-all-bookers-participants';

export interface POSTChangeMenuEndDateInBulkBody {
  type: ToolType;
}

const { NEXT_PUBLIC_ENV } = process.env;

function processDateByTimezone(date: Date) {
  let OFFSET_HOURS = 7;
  if (NEXT_PUBLIC_ENV === 'development') {
    OFFSET_HOURS = 0;
  }

  return new Date(date.setHours(date.getHours() - OFFSET_HOURS)).getTime();
}

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const { type } = req.body as POSTChangeMenuEndDateInBulkBody;
    const integrationSdk = getIntegrationSdk();

    switch (apiMethod) {
      case HttpMethod.POST: {
        if (type === 'change-end-date-in-bulk') {
          const oldEndDate = processDateByTimezone(TIME_FROM);
          const endDate = processDateByTimezone(TIME_TO);

          const menus = await queryAllPages({
            sdkModel: integrationSdk.listings,
            query: {
              meta_listingType: EListingType.menu,
              meta_menuType: EMenuType.fixedMenu,
              pub_endDate: oldEndDate,
            },
          });

          const updatePromises = menus.map((menu: any) => {
            const menuId = menu.id.uuid;
            const newPublicData = {
              ...menu.attributes.publicData,
              endDate,
            };

            return integrationSdk.listings.update({
              id: menuId,
              publicData: newPublicData,
            });
          });

          await Promise.all(updatePromises);
          res.status(200).json({
            message: 'success',
            data: {
              ids: menus.map((menu: any) => menu.id.uuid),
              oldEndDate,
              endDate,
            },
          });
        }

        if (type === 'fetch-all-bookers-participants') {
          const companies: UserListing[] = await queryAllPages({
            sdkModel: integrationSdk.users,
            query: {
              meta_isCompany: true,
            },
          });
          const users: UserListing[] = await queryAllPages({
            sdkModel: integrationSdk.users,
            query: {},
          });

          res.status(200).json(
            users
              .filter(
                (user) =>
                  !user.attributes?.profile?.displayName?.startsWith(
                    'Sub account for',
                  ),
              )
              .map((user) => ({
                email: user.attributes?.email,
                fullName: buildFullName(
                  user.attributes?.profile?.firstName,
                  user.attributes?.profile?.lastName,
                  {
                    compareToGetLongerWith:
                      user.attributes?.profile?.displayName,
                  },
                ),
                companyName:
                  companies.find(
                    (company) =>
                      company.id?.uuid ===
                      user.attributes?.profile?.metadata?.companyList?.[0],
                  )?.attributes?.profile?.publicData?.companyName ||
                  companies.find((company) =>
                    user.attributes?.profile?.metadata?.companyList?.includes(
                      company.id?.uuid,
                    ),
                  )?.attributes?.profile?.publicData?.companyName,
                role: user.attributes?.profile?.metadata?.isPartner
                  ? 'partner'
                  : user.attributes?.profile?.metadata?.isAdmin
                  ? 'admin'
                  : user.attributes?.profile?.metadata?.company &&
                    isUserABookerOrOwner(user)
                  ? 'booker'
                  : 'participant',
              })),
          );
        }
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(adminChecker(handler));
