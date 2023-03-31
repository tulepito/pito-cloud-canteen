import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import checkUnConflictedMenuMiddleware from '@pages/api/apiServices/menu/checkUnConflictedMenuMiddleware.service';
import createMenu from '@pages/api/apiServices/menu/createMenu.service';
import cookies from '@services/cookie';
import adminChecker from '@services/permissionChecker/admin';
import { handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const { dataParams, queryParams = {} } = req.body;
    switch (apiMethod) {
      case HttpMethod.GET:
        break;
      case HttpMethod.POST: {
        const menu = await createMenu(dataParams, queryParams);

        return res.status(200).json(menu);
      }
      case HttpMethod.DELETE:
        break;
      case HttpMethod.PUT:
        break;
      default:
        break;
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

const handlerWrapper = (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case HttpMethod.POST: {
      const { dataParams = {} } = req.body;

      const {
        mealType,
        daysOfWeek = [],
        startDate,
        endDate,
        restaurantId,
      } = dataParams;

      const dataToCheck = {
        mealType,
        restaurantId,
        daysOfWeek,
        startDate,
        endDate,
      };

      return checkUnConflictedMenuMiddleware(handler)(req, res, dataToCheck);
    }

    default:
      return handler(req, res);
  }
};

export default cookies(adminChecker(handlerWrapper));
