import { isEmpty } from 'lodash';

import { queryAllPages } from '@helpers/apiHelpers';
import { getMenuQueryInSpecificDay } from '@helpers/listingSearchQuery';
import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/integrationSdk';
import { Listing } from '@src/utils/data';
import { ERestaurantListingStatus } from '@src/utils/enums';
import type { TPlan } from '@src/utils/orderTypes';
import type { TListing, TObject } from '@src/utils/types';

export const checkRestaurantAvailableStatus = async (
  order: TListing,
  orderDetail: TPlan['orderDetail'],
) => {
  const integrationSdk = getIntegrationSdk();
  const orderDetailAvailableStatus: TObject = {};
  await Promise.all(
    Object.keys(orderDetail).map(async (timestamp) => {
      const { restaurant } = orderDetail[timestamp] || {};
      const { menuId, id: restaurantId, foodList } = restaurant || {};

      if (isEmpty(restaurantId)) {
        orderDetailAvailableStatus[timestamp] = true;
      }

      if (isEmpty(foodList)) {
        orderDetailAvailableStatus[timestamp] = false;

        return;
      }

      const [restaurantListing] = denormalisedResponseEntities(
        (await integrationSdk.listings.show({ id: restaurantId })) || [{}],
      );

      const { status = ERestaurantListingStatus.authorized } =
        Listing(restaurantListing).getMetadata();
      const {
        stopReceiveOrder = false,
        startStopReceiveOrderDate = 0,
        endStopReceiveOrderDate = 0,
      } = Listing(restaurantListing).getPublicData();
      const isInStopReceiveOrderTime =
        stopReceiveOrder &&
        Number(timestamp) >= startStopReceiveOrderDate &&
        Number(timestamp) <= endStopReceiveOrderDate;

      if (isInStopReceiveOrderTime) {
        orderDetailAvailableStatus[timestamp] = false;

        return;
      }
      if (status !== ERestaurantListingStatus.authorized) {
        orderDetailAvailableStatus[timestamp] = false;

        return;
      }

      const menuQuery = getMenuQueryInSpecificDay({
        order,
        timestamp: +timestamp,
        options: {
          ignoreSearchByPackagePermember: true,
        },
      });
      const allMenus = await queryAllPages({
        sdkModel: integrationSdk.listings,
        query: menuQuery,
      });

      const isMenuValid =
        allMenus.findIndex((menu: TListing) => menu.id.uuid === menuId) !== -1;

      orderDetailAvailableStatus[timestamp] = isMenuValid;
    }),
  );

  return orderDetailAvailableStatus;
};
