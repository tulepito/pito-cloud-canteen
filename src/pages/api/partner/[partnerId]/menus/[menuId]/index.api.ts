import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import checkUnConflictedMenuMiddleware from '@pages/api/apiServices/menu/checkUnConflictedMenuMiddleware.service';
import updateMenu from '@pages/api/apiServices/menu/updateMenu.service';
import cookies from '@services/cookie';
import partnerChecker from '@services/permissionChecker/partner';
import { getIntegrationSdk, handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { menuId } = req.query;
    const integrationSdk = getIntegrationSdk();

    switch (req.method) {
      case HttpMethod.GET: {
        const { JSONParams = '' } = req.query;

        const { dataParams = {}, queryParams = {} } =
          JSON.parse(JSONParams as string) || {};

        const response = await integrationSdk.listings.show(
          { id: menuId, ...dataParams },
          queryParams,
        );

        return res.json(response);
      }
      case HttpMethod.PUT: {
        const { dataParams, queryParams = {} } = req.body;
        const menu = await updateMenu(
          menuId as string,
          dataParams,
          queryParams,
        );

        return res.status(200).json(menu);
      }

      default:
        break;
    }
  } catch (error) {
    console.log(error);
    handleError(res, error);
  }
}

const handlerWrapper = (req: NextApiRequest, res: NextApiResponse) => {
  const { menuId } = req.query;
  const { dataParams = {} } = req.body;

  switch (req.method) {
    case HttpMethod.PUT: {
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
        id: menuId as string,
        startDate,
        endDate,
      };

      return checkUnConflictedMenuMiddleware(handler)(req, res, dataToCheck);
    }

    default: {
      return handler(req, res);
    }
  }
};

export default cookies(partnerChecker(handlerWrapper));
