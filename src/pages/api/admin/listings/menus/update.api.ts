import type { NextApiRequest, NextApiResponse } from 'next';

import {
  checkUnConflictedMenuMiddleware,
  updateMenuIdListAndMenuWeekDayListForFood,
} from '@pages/api/helpers/menuHelpers';
import cookies from '@services/cookie';
import adminChecker from '@services/permissionChecker/admin';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { denormalisedResponseEntities } from '@utils/data';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { dataParams, queryParams = {} } = req.body;
    const integrationSdk = getIntegrationSdk();
    const response = await integrationSdk.listings.update(
      dataParams,
      queryParams,
    );

    const [menu] = denormalisedResponseEntities(response);

    await updateMenuIdListAndMenuWeekDayListForFood(menu);

    res.json(response);
  } catch (error) {
    console.error(error);
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

export default cookies(adminChecker(handlerWithCustomParams));
