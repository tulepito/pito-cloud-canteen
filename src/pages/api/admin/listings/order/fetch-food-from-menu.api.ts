import { DateTime } from 'luxon';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { fetchListing } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { handleError } from '@services/sdk';
import { denormalisedResponseEntities, Listing } from '@src/utils/data';
import { convertWeekDay, VNTimezone } from '@src/utils/dates';
import { EImageVariants } from '@src/utils/enums';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const integrationSdk = getIntegrationSdk();

    switch (apiMethod) {
      case HttpMethod.GET: {
        const {
          menuId,
          subOrderDate,
          nutritions = [],
        } = JSON.parse(req.query.JSONParams as string);

        const dateTime = DateTime.fromMillis(+subOrderDate).setZone(VNTimezone);
        const dayOfWeek = convertWeekDay(dateTime.weekday).key;

        const menu = await fetchListing(menuId as string);
        const menuListing = Listing(menu);
        const foodIdList = menuListing.getMetadata()[`${dayOfWeek}FoodIdList`];
        const foodList = await integrationSdk.listings.query({
          ids: foodIdList,
          ...(nutritions.length > 0
            ? { pub_specialDiets: `has_any:${nutritions.join(',')}` }
            : {}),
          include: ['images'],
          'fields.image': [`variants.${EImageVariants.default}`],
        });

        return res.status(200).json(denormalisedResponseEntities(foodList));
      }

      default:
        break;
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(handler);
