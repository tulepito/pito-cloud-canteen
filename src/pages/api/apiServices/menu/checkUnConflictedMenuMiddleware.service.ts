import uniqBy from 'lodash/uniqBy';
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

import { errorMessages } from '@apis/errors';
import {
  type TCheckUnConflictedParams,
  queryAllPages,
} from '@helpers/apiHelpers';
import { getIntegrationSdk } from '@services/integrationSdk';
import { handleError } from '@services/sdk';
import { denormalisedResponseEntities, IntegrationListing } from '@utils/data';
import { findClassDays } from '@utils/dates';
import { EListingMenuStates, EListingStates, EListingType } from '@utils/enums';
import type { TIntegrationListing } from '@utils/types';

const checkUnConflictedMenuMiddleware =
  (handler: NextApiHandler) =>
  async (
    req: NextApiRequest,
    res: NextApiResponse,
    params: TCheckUnConflictedParams,
  ) => {
    try {
      const integrationSdk = getIntegrationSdk();
      const {
        mealType,
        mealTypes = [],
        daysOfWeek = [],
        restaurantId,
        id,
        startDate,
        endDate,
      } = params;

      const defaultQueryParams = {
        meta_listingType: EListingType.menu,
        meta_restaurantId: restaurantId,
        meta_isDeleted: false,
      };

      const daysOfWeekInRange = findClassDays(
        daysOfWeek,
        new Date(startDate),
        new Date(endDate),
      );

      const daysOfWeekAsString = daysOfWeek.join(',');
      const listingStatesAsString = [
        EListingStates.published,
        EListingStates.draft,
        EListingMenuStates.pendingRestaurantApproval,
      ].join(',');
      let listings: TIntegrationListing[] = [];

      const listingsBaseOnMealType = denormalisedResponseEntities(
        await integrationSdk.listings.query({
          pub_mealType: mealType,
          pub_daysOfWeek: `has_any:${daysOfWeekAsString}`,
          meta_listingState: listingStatesAsString,
          ...defaultQueryParams,
        }),
      ) as TIntegrationListing[];
      listings = listings.concat(listingsBaseOnMealType);

      if (mealTypes.length > 0) {
        const listingsBaseOnMealTypes = await queryAllPages({
          sdkModel: integrationSdk.listings,
          query: {
            pub_mealTypes: `has_any:${mealTypes.join(',')}`,
            pub_daysOfWeek: `has_any:${daysOfWeekAsString}`,
            meta_listingState: listingStatesAsString,
            ...defaultQueryParams,
          },
        });

        listings = uniqBy(listings.concat(listingsBaseOnMealTypes), 'id.uuid');
      }

      const inValidListings = listings.filter((l) => {
        const {
          startDate: listingStartDate,
          endDate: listingEndDate,
          daysOfWeek: listingDayOfWeek,
        } = IntegrationListing(l).getPublicData();

        const listingDaysOfWeekInRange = findClassDays(
          listingDayOfWeek,
          new Date(listingStartDate),
          new Date(listingEndDate),
        );

        return daysOfWeekInRange.some((d) =>
          listingDaysOfWeekInRange.includes(d),
        );
      });

      const listingWithoutNewMenu = id
        ? inValidListings.filter((l) => l.id.uuid !== id)
        : inValidListings;

      if (listingWithoutNewMenu.length > 0 && daysOfWeek.length > 0) {
        return handleError(res, {
          status: errorMessages.VALIDATE_MENU_ERROR_CONFLICT.code,
          statusText: errorMessages.VALIDATE_MENU_ERROR_CONFLICT.id,
          data: {
            message: errorMessages.VALIDATE_MENU_ERROR_CONFLICT.message,
            data: {
              mealType,
              daysOfWeek,
              restaurantId,
              id,
            },
          },
        });
      }

      return handler(req, res);
    } catch (error) {
      console.error('error', error);
      handleError(res, error);
    }
  };

export default checkUnConflictedMenuMiddleware;
