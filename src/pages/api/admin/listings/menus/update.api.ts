/* eslint-disable no-console */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {
  checkUnconflictedMenuMiddleware,
  updateMenuIdListAndMenuWeekDayListForFood,
} from '@pages/api/helpers/menuHelpers';
import cookies from '@services/cookie';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { denormalisedResponseEntities } from '@utils/data';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { dataParams, queryParams = {} } = req.body;
    const intergrationSdk = getIntegrationSdk();
    const response = await intergrationSdk.listings.update(
      dataParams,
      queryParams,
    );

    const [menu] = denormalisedResponseEntities(response);

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
  return checkUnconflictedMenuMiddleware(handler)(req, res, dataToCheck);
};

export default cookies(handlerWithCustomParams);
