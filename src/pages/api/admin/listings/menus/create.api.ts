/* eslint-disable no-console */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {
  checkUnConflictedMenuMiddleware,
  updateMenuIdListAndMenuWeekDayListForFood,
} from '@pages/api/helpers/menuHelpers';
import cookies from '@services/cookie';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { denormalisedResponseEntities } from '@utils/data';
import type { TIntegrationListing } from '@utils/types';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { dataParams, queryParams = {} } = req.body;
    const integrationSdk = getIntegrationSdk();
    const { metadata } = dataParams;
    const { restaurantId } = metadata;

    const restaurantRes = await integrationSdk.listings.show({
      id: restaurantId,
      include: ['author'],
    });
    const [restaurant] = denormalisedResponseEntities(restaurantRes);

    const { geolocation } = restaurant.attributes;

    const response = await integrationSdk.listings.create(
      {
        ...dataParams,
        metadata: {
          ...metadata,
          restaurantName: restaurant.attributes.title,
        },
        ...(geolocation ? { geolocation } : {}),
        state: 'published',
        authorId: restaurant?.author.id.uuid,
      },
      queryParams,
    );

    const [menu] = denormalisedResponseEntities(
      response,
    ) as TIntegrationListing[];

    await updateMenuIdListAndMenuWeekDayListForFood(menu);

    res.json(response);
  } catch (error) {
    console.log(error);
    handleError(res, error);
  }
}

const handlerWithCustomParams = (req: NextApiRequest, res: NextApiResponse) => {
  const { dataParams = {} } = req.body;

  const { publicData = {}, metadata = {}, id } = dataParams || {};
  const { mealType, daysOfWeek = [], startDate, endDate } = publicData;
  const { restaurantId } = metadata;
  const dataToCheck = {
    mealType,
    restaurantId,
    daysOfWeek,
    id,
    startDate,
    endDate,
  };
  return checkUnConflictedMenuMiddleware(handler)(req, res, dataToCheck);
};

export default cookies(handlerWithCustomParams);
