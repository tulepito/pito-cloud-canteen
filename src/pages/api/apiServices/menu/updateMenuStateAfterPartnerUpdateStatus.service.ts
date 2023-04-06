import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/integrationSdk';
import {
  EListingMenuStates,
  EListingType,
  ERestaurantListingStatus,
} from '@src/utils/enums';
import type { TIntegrationListing } from '@src/utils/types';

import checkIsInTransactionProgressMenu from './checkIsInTransactionProgressMenu.service';

const updateMenuStateAfterPartnerUpdateStatus = async (
  restaurantId: string,
  status: ERestaurantListingStatus,
) => {
  const integrationSdk = getIntegrationSdk();

  const stateToQuery =
    status === ERestaurantListingStatus.unsatisfactory
      ? EListingMenuStates.published
      : EListingMenuStates.pendingRestaurantApproval;

  const stateToUpdate =
    status === ERestaurantListingStatus.unsatisfactory
      ? EListingMenuStates.pendingRestaurantApproval
      : EListingMenuStates.published;

  const response = await integrationSdk.listings.query({
    meta_restaurantId: restaurantId,
    meta_listingState: stateToQuery,
    meta_listingType: EListingType.menu,
  });

  const menus = denormalisedResponseEntities(response);

  await Promise.all(
    menus.map(async (menu: TIntegrationListing) => {
      const isMenuInTranactionProgress = await checkIsInTransactionProgressMenu(
        menu.id.uuid,
      );

      if (!isMenuInTranactionProgress) {
        await integrationSdk.listings.update({
          id: menu.id.uuid,
          metadata: {
            listingState: stateToUpdate,
          },
        });
      }
    }),
  );
};

export default updateMenuStateAfterPartnerUpdateStatus;
