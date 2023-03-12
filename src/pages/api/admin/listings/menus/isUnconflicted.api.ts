import type { NextApiRequest, NextApiResponse } from 'next';

import { checkUnConflictedMenuMiddleware } from '@pages/api/helpers/menuHelpers';
import cookies from '@services/cookie';
import adminChecker from '@services/permissionChecker/admin';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.send(true);
}

const handlerWithCustomParams = (req: NextApiRequest, res: NextApiResponse) => {
  const params = req.body;
  const {
    mealType,
    daysOfWeek = [],
    restaurantId,
    id,
    startDate,
    endDate,
  } = params;
  const dataToCheck = {
    mealType,
    daysOfWeek,
    restaurantId,
    id,
    startDate,
    endDate,
  };

  return checkUnConflictedMenuMiddleware(handler)(req, res, dataToCheck);
};

export default cookies(adminChecker(handlerWithCustomParams));
