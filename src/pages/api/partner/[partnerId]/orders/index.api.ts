import { mapLimit } from 'async';
import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { queryAllListings } from '@helpers/apiHelpers';
import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { Listing } from '@src/utils/data';
import { EListingType } from '@src/utils/enums';
import type { TListing } from '@src/utils/types';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { partnerId /* JSONParams */ } = req.query;
    // const {} = JSON.parse(JSONParams as string);

    const apiMethod = req.method;
    const integrationSdk = getIntegrationSdk();

    switch (apiMethod) {
      case HttpMethod.GET: {
        const orders = await queryAllListings({
          query: {
            meta_partnerIds: `has_any:${partnerId}`,
            meta_listingType: EListingType.order,
          },
        });

        const orderWithPlanDataMaybe = async (order: TListing) => {
          const { plans = [] } = Listing(order).getMetadata();

          const planId = plans[0];

          if (planId) {
            const [planListing] = denormalisedResponseEntities(
              (await integrationSdk.listings.show({ id: planId })) || [{}],
            );

            if (!isEmpty(planListing)) {
              return { ...order, plan: planListing };
            }
          }

          return order;
        };

        const ordersWithPlanData = await mapLimit(
          orders,
          10,
          orderWithPlanDataMaybe,
        );

        return res.status(200).json({ orders: ordersWithPlanData });
      }

      default:
        break;
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default handler;
