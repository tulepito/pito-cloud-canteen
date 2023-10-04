import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import checkUnConflictedMenuMiddleware from '@pages/api/apiServices/menu/checkUnConflictedMenuMiddleware.service';
import createMenu from '@pages/api/apiServices/menu/createMenu.service';
import updateMenu from '@pages/api/apiServices/menu/updateMenu.service';
import cookies from '@services/cookie';
import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/integrationSdk';
import partnerChecker from '@services/permissionChecker/partner';
import { handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const integrationSdk = getIntegrationSdk();
    const { JSONParams = '' } = req.query;
    const { dataParams, queryParams = {} } = req.body;

    switch (apiMethod) {
      case HttpMethod.GET: {
        const { menuId } = JSON.parse(JSONParams as string);

        const [menu] = denormalisedResponseEntities(
          await integrationSdk.listings.show(
            {
              id: menuId,
            },
            { expand: true },
          ),
        );

        return res.status(200).json(menu);
      }
      case HttpMethod.POST: {
        const menu = await createMenu(dataParams, queryParams);

        return res.status(200).json(menu);
      }

      case HttpMethod.PUT: {
        const menu = await updateMenu(
          dataParams?.id as string,
          dataParams,
          queryParams,
        );

        return res.status(200).json(menu);
      }

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
    case HttpMethod.POST:
    case HttpMethod.PUT: {
      const { dataParams = {} } = req.body;

      const {
        mealType,
        mealTypes = [],
        daysOfWeek = [],
        startDate,
        endDate,
        restaurantId,
        id,
      } = dataParams;

      const dataToCheck = {
        mealType,
        mealTypes,
        restaurantId,
        daysOfWeek,
        startDate,
        endDate,
        id,
      };

      return checkUnConflictedMenuMiddleware(handler)(req, res, dataToCheck);
    }

    default:
      return handler(req, res);
  }
};

export default cookies(partnerChecker(handlerWrapper));
