/* eslint-disable no-console */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { checkUnConflictedMenuMiddleware } from '@pages/api/helpers/menuHelpers';
import cookies from '@services/cookie';
import type { NextApiRequest, NextApiResponse } from 'next';

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

export default cookies(handlerWithCustomParams);
