import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { queryAllPages } from '@helpers/apiHelpers';
import cookies from '@services/cookie';
import { getIntegrationSdk } from '@services/integrationSdk';
import adminChecker from '@services/permissionChecker/admin';
import { handleError } from '@services/sdk';
import { EListingType, EMenuType } from '@src/utils/enums';

const TIME_FROM = new Date('12/31/2023');
const TIME_TO = new Date('12/31/2024');

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
    const integrationSdk = getIntegrationSdk();

    switch (apiMethod) {
      case HttpMethod.PUT: {
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
