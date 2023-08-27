import { chunk, flatten, map } from 'lodash';
import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { queryAllListings } from '@helpers/apiHelpers';
import { getIntegrationSdk } from '@services/integrationSdk';
import { handleError } from '@services/sdk';
import { denormalisedResponseEntities, Listing } from '@src/utils/data';
import { EListingType } from '@src/utils/enums';
import type { TListing, TObject } from '@src/utils/types';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const {
      method: apiMethod,
      query: { partnerId },
    } = req;

    switch (apiMethod) {
      case HttpMethod.GET: {
        const integrationSdk = getIntegrationSdk();
        const orders = await queryAllListings({
          query: {
            meta_partnerIds: `has_any:${partnerId}`,
            meta_listingType: EListingType.order,
          },
        });

        const planIds = orders.map(
          (order: TListing) => Listing(order).getMetadata().plans[0],
        );
        const chunkedPlanIds = chunk(planIds, 100);

        const allPlans = flatten(
          await Promise.all(
            chunkedPlanIds.map(async (ids) => {
              const plans = denormalisedResponseEntities(
                await integrationSdk.listings.query({
                  ids: ids.join(','),
                }),
              );

              return plans;
            }),
          ),
        );

        const orderWithPlanDataMaybe = map(orders, (order: TListing) => {
          const { plans = [] } = Listing(order).getMetadata();

          const planId = plans[0];
          let resultValue = order as TObject;

          if (planId) {
            const planListing = allPlans.find(
              (plan: TListing) => Listing(plan).getId() === planId,
            );

            if (!isEmpty(planListing)) {
              resultValue = { ...resultValue, plan: planListing };

              return resultValue;
            }
          }

          return order;
        });

        return res.status(200).json({ orders: orderWithPlanDataMaybe });
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
