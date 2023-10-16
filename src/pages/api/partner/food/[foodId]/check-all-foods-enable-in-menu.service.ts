import flatten from 'lodash/flatten';
import uniq from 'lodash/uniq';
import uniqBy from 'lodash/uniqBy';

import { DAY_IN_WEEK } from '@components/CalendarDashboard/helpers/constant';
import { fetchListingsByChunkedIds } from '@helpers/apiHelpers';
import { getIntegrationSdk } from '@services/integrationSdk';
import { denormalisedResponseEntities, Listing } from '@src/utils/data';
import { EListingMenuStates, EListingType } from '@src/utils/enums';
import type { TListing } from '@src/utils/types';

export const checkAllFoodsEnableInMenu = async (foodId: string) => {
  const integrationSdk = getIntegrationSdk();
  const menus = uniqBy(
    flatten(
      await Promise.all(
        DAY_IN_WEEK.map(async (weekday) => {
          const response = await integrationSdk.listings.query({
            meta_listingType: EListingType.menu,
            [`meta_${weekday.slice(0, 3)}FoodIdList`]: foodId,
            meta_isDeleted: false,
          });

          return denormalisedResponseEntities(response);
        }),
      ),
    ),
    'id.uuid',
  );

  await Promise.all(
    menus.map(async (menu: TListing) => {
      const menuListing = Listing(menu);
      const {
        monFoodIdList = [],
        tueFoodIdList = [],
        wedFoodIdList = [],
        thuFoodIdList = [],
        friFoodIdList = [],
        satFoodIdList = [],
        sunFoodIdList = [],
      } = menuListing.getMetadata();

      const allFoodIdList = uniq([
        ...monFoodIdList,
        ...tueFoodIdList,
        ...wedFoodIdList,
        ...thuFoodIdList,
        ...friFoodIdList,
        ...satFoodIdList,
        ...sunFoodIdList,
      ]);

      const allFoods = await fetchListingsByChunkedIds(
        allFoodIdList,
        integrationSdk,
      );

      const isAllFoodsDisabled = allFoods.every(
        (food) => !Listing(food).getMetadata().isFoodEnable,
      );

      if (isAllFoodsDisabled) {
        await integrationSdk.listings.update(
          {
            id: menuListing.getId(),
            metadata: {
              listingState: EListingMenuStates.closed,
            },
          },
          { expand: true },
        );
      }
    }),
  );
};
