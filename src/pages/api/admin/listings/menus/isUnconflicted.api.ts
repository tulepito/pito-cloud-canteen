import cookies from '@services/cookie';
import type { NextApiRequest, NextApiResponse } from 'next';

import { checkUnConflictedMenuMiddleware } from './apiHelpers';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.send(true);
}

const handlerWithCustomParams = (req: NextApiRequest, res: NextApiResponse) => {
  const params = req.body;
  const { mealType, daysOfWeek = [], restaurantId, id } = params;
  const dataToCheck = {
    mealType,
    daysOfWeek,
    restaurantId,
    id,
  };
  return checkUnConflictedMenuMiddleware(handler)(req, res, dataToCheck);
};

export default cookies(handlerWithCustomParams);
