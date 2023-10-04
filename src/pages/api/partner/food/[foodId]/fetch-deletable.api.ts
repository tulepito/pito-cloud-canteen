import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import { getIntegrationSdk } from '@services/integrationSdk';
import { handleError } from '@services/sdk';
import { denormalisedResponseEntities, Listing } from '@src/utils/data';
import { EListingType, EOrderStates } from '@src/utils/enums';
import type { TListing } from '@src/utils/types';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const integrationSdk = getIntegrationSdk();
    const { foodId } = req.query;
    const menus = denormalisedResponseEntities(
      await integrationSdk.listings.query({
        meta_listingType: EListingType.menu,
        meta_monFoodIdList: foodId,
        meta_tueFoodIdList: foodId,
        meta_wedFoodIdList: foodId,
        meta_thuFoodIdList: foodId,
        meta_friFoodIdList: foodId,
        meta_satFoodIdList: foodId,
        meta_sunFoodIdList: foodId,
        meta_isDeleted: false,
      }),
    );

    if (menus.length === 0) {
      return res.json({
        isDeletable: true,
      });
    }

    const menuIds = menus.map((menu: TListing) => menu.id.uuid);

    const plans = denormalisedResponseEntities(
      await integrationSdk.listings.query({
        meta_listingType: EListingType.subOrder,
        meta_menuIds: menuIds,
      }),
    );

    if (plans.length === 0) {
      return res.json({
        isDeletable: true,
      });
    }

    const orderIds = plans.map(
      (plan: TListing) => Listing(plan).getMetadata().orderId,
    );

    const orders = denormalisedResponseEntities(
      await integrationSdk.listings.query({
        meta_listingType: EListingType.order,
        ids: orderIds.slice(0, 100),
        meta_orderState: [
          EOrderStates.picking,
          EOrderStates.inProgress,
          EOrderStates.pendingPayment,
          EOrderStates.completed,
        ],
      }),
    );

    if (orders.length === 0) {
      return res.json({
        isDeletable: true,
      });
    }

    return res.json({
      isDeletable: false,
    });
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(handler);
