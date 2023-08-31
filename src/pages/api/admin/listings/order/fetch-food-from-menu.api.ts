import { DateTime } from 'luxon';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { fetchListing } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { handleError } from '@services/sdk';
import { denormalisedResponseEntities, Listing } from '@src/utils/data';
import { convertWeekDay } from '@src/utils/dates';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const integrationSdk = getIntegrationSdk();

    switch (apiMethod) {
      case HttpMethod.GET: {
        const { menuId, subOrderDate } = JSON.parse(
          req.query.JSONParams as string,
        );

        const dateTime = DateTime.fromMillis(+subOrderDate);
        const dayOfWeek = convertWeekDay(dateTime.weekday).key;

        const menu = await fetchListing(menuId as string);
        const menuListing = Listing(menu);
        const foodIdList = menuListing.getMetadata()[`${dayOfWeek}FoodIdList`];
        const foodList = await integrationSdk.listings.query({
          ids: foodIdList,
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
