import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import checkUnConflictedMenuMiddleware from '@pages/api/apiServices/menu/checkUnConflictedMenuMiddleware.service';
import duplicateMenu from '@pages/api/apiServices/menu/duplicateMenu.service';
import cookies from '@services/cookie';
import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/integrationSdk';
import adminChecker from '@services/permissionChecker/admin';
import { handleError } from '@services/sdk';
import { IntegrationListing } from '@src/utils/data';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    switch (req.method) {
      case HttpMethod.POST: {
        const { menuId } = req.query;
        const { dataParams, queryParams = {} } = req.body;

        const response = await duplicateMenu(
          menuId as string,
          dataParams,
          queryParams,
        );

        return res.status(200).json(response);
      }

      default:
        break;
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

const handlerWrapper = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case HttpMethod.POST: {
      const { dataParams = {} } = req.body;
      const { menuId } = req.query;

      const { mealType, daysOfWeek, startDate, endDate, restaurantId } =
        dataParams;

      const integrationSdk = getIntegrationSdk();

      const menuResponse = await integrationSdk.listings.show(
        {
          id: menuId,
        },
        {
          expand: true,
        },
      );

      const [menu] = denormalisedResponseEntities(menuResponse);

      const {
        mealType: mealTyperFromMenu,
        startDate: startDateFromMenu,
        endDate: endDateFromMenu,
        daysOfWeek: daysOfWeekFromMenu,
      } = IntegrationListing(menu).getPublicData();

      const { restaurantId: restaurantIdFromMenu } =
        IntegrationListing(menu).getMetadata();

      const dataToCheck = {
        ...(mealType ? { mealType } : { mealType: mealTyperFromMenu }),
        ...(restaurantId
          ? { restaurantId }
          : { restaurantId: restaurantIdFromMenu }),
        ...(daysOfWeek
          ? { daysOfWeek: daysOfWeek || [] }
          : { daysOfWeek: daysOfWeekFromMenu || [] }),
        ...(startDate ? { startDate } : { startDate: startDateFromMenu }),
        ...(endDate ? { endDate } : { endDate: endDateFromMenu }),
      };

      return checkUnConflictedMenuMiddleware(handler)(req, res, dataToCheck);
    }

    default:
      return handler(req, res);
  }
};

export default cookies(adminChecker(handlerWrapper));
