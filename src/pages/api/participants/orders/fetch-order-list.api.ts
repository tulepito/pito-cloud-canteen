import chunk from 'lodash/chunk';
import flatten from 'lodash/flatten';
import uniq from 'lodash/uniq';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { getParticipantOrdersQueries } from '@helpers/listingSearchQuery';
import cookies from '@services/cookie';
import participantChecker from '@services/permissionChecker/participant';
import { getSdk, handleError } from '@services/sdk';
import { denormalisedResponseEntities, Listing } from '@src/utils/data';
import { getEndOfMonth } from '@src/utils/dates';
import type { TListing } from '@src/utils/types';

const fetchListingsByChunkedIds = async (ids: string[], sdk: any) => {
  const listingsResponse = await Promise.all(
    chunk<string>(ids, 100).map(async (_ids) => {
      const response = await sdk.listings.query({
        ids: _ids,
      });

      return denormalisedResponseEntities(response);
    }),
  );

  return flatten(listingsResponse);
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const sdk = getSdk(req, res);

    switch (apiMethod) {
      case HttpMethod.GET: {
        const { JSONParams } = req.query;
        const { selectedMonth } = JSON.parse(JSONParams as string);
        const currentUser = denormalisedResponseEntities(
          await sdk.currentUser.show(),
        )[0];

        const ordersQuery = getParticipantOrdersQueries({
          userId: currentUser.id.uuid,
          startDate: new Date(selectedMonth).getTime(),
          endDate: getEndOfMonth(new Date(selectedMonth)).getTime(),
        })[0];

        const response = await sdk.listings.query(ordersQuery);
        const orders = denormalisedResponseEntities(response);

        const allPlansIdList = orders.map((order: TListing) => {
          const orderListing = Listing(order);
          const { plans = [] } = orderListing.getMetadata();

          return plans[0];
        });
        const allPlans = await fetchListingsByChunkedIds(allPlansIdList, sdk);

        const allRelatedRestaurantsIdList = uniq(
          allPlans.map((plan: TListing) => {
            const planListing = Listing(plan);
            const { orderDetail = {} } = planListing.getMetadata();

            return Object.values(orderDetail).map(
              (subOrder: any) => subOrder?.restaurant?.id,
            );
          }),
        );

        const allRelatedRestaurants = await fetchListingsByChunkedIds(
          flatten(allRelatedRestaurantsIdList),
          sdk,
        );

        const mappingSubOrderToOrder = orders.reduce(
          (result: any, order: TListing) => {
            const orderListing = Listing(order);
            const orderId = orderListing.getId();
            const { plans = [] } = orderListing.getMetadata();
            const planIdWithOrderId = plans.reduce(
              (mapping: any[], planId: string) => {
                return {
                  ...mapping,
                  [planId]: orderId,
                };
              },
              {},
            );

            return {
              ...result,
              ...planIdWithOrderId,
            };
          },
          {},
        );

        return res.status(200).json({
          orders,
          allPlans: flatten(allPlans),
          restaurants: allRelatedRestaurants,
          mappingSubOrderToOrder,
        });
      }
      default:
        break;
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(participantChecker(handler));
