import { errorMessages } from '@apis/errors';
import { getIntegrationSdk } from '@services/integrationSdk';
import { handleError } from '@services/sdk';
import { denormalisedResponseEntities } from '@utils/data';
import { EListingType } from '@utils/enums';
import type { TIntegrationListing } from '@utils/types';
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

const validateMenu =
  (handler: NextApiHandler) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const { dataParams = {} } = req.body;
      const integrationSdk = getIntegrationSdk();

      const { publicData = {}, metadata = {}, id } = dataParams || {};
      const { mealType, daysOfWeek = [] } = publicData;
      const { restaurantId } = metadata;
      const daysOfWeekAsString = daysOfWeek.join(',');
      const response = await integrationSdk.listings.query({
        pub_mealType: mealType,
        pub_daysOfWeek: daysOfWeekAsString,
        meta_listingType: EListingType.menu,
        meta_restaurantId: restaurantId,
      });

      const listings = denormalisedResponseEntities(
        response,
      ) as TIntegrationListing[];

      const listingWithoutNewMenu = id
        ? listings.filter((l) => l.id.uuid !== id)
        : listings;

      if (listingWithoutNewMenu.length > 0 && daysOfWeek.length > 0) {
        return handleError(res, {
          status: errorMessages.VALIDATE_MENU_ERROR_CONFLICT.code,
          statusText: errorMessages.VALIDATE_MENU_ERROR_CONFLICT.id,
          data: {
            message: errorMessages.VALIDATE_MENU_ERROR_CONFLICT.message,
          },
        });
      }
      return handler(req, res);
    } catch (error) {
      console.error('error', error);
      handleError(res, error);
    }
  };

export default validateMenu;
