import flatten from 'lodash/flatten';
import uniqBy from 'lodash/uniqBy';
import type { NextApiRequest, NextApiResponse } from 'next';

import { DAY_IN_WEEK } from '@components/CalendarDashboard/helpers/constant';
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

    if (menus.length === 0) {
      return res.json({
        isDeletable: true,
      });
    }

    const menuIds = menus.map((menu: TListing) => menu.id.uuid);

    const plans = denormalisedResponseEntities(
      await integrationSdk.listings.query({
        meta_listingType: EListingType.subOrder,
        meta_menuIds: `has_any:${menuIds.join(',')}`,
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
