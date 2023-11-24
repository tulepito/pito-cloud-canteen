import flatten from 'lodash/flatten';
import uniq from 'lodash/uniq';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { fetchListingsByChunkedIds } from '@helpers/apiHelpers';
import { getParticipantOrdersQueries } from '@helpers/listingSearchQuery';
import cookies from '@services/cookie';
import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import participantChecker from '@services/permissionChecker/participant';
import { getSdk, handleError } from '@services/sdk';
import {
  CurrentUser,
  denormalisedResponseEntities,
  Listing,
} from '@src/utils/data';
import { EImageVariants } from '@src/utils/enums';
import type { TListing } from '@src/utils/types';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const sdk = getSdk(req, res);
    const integrationSdk = getIntegrationSdk();

    switch (apiMethod) {
      case HttpMethod.GET: {
        const { JSONParams } = req.query;
        const currentUser = denormalisedResponseEntities(
          await sdk.currentUser.show(),
        )[0];

        const { startDate, endDate } = JSON.parse(JSONParams as string);
        const ordersQueries = getParticipantOrdersQueries({
          userId: currentUser.id.uuid,
          startDate: new Date(startDate).getTime(),
          endDate: new Date(endDate).getTime(),
        });

        const responses = await Promise.all(
          ordersQueries.map(async (query) => {
            const response = await integrationSdk.listings.query(query);

            return denormalisedResponseEntities(response);
          }),
        );
        const orders = flatten(responses);

        const allPlansIdList = orders.map((order: TListing) => {
          const orderListing = Listing(order);
          const { plans = [] } = orderListing.getMetadata();

          return plans[0];
        });
        const allPlanListings = await fetchListingsByChunkedIds(
          allPlansIdList,
          integrationSdk,
        );

        const allRelatedRestaurantsIdList = uniq(
          allPlanListings.map((plan: TListing) => {
            const planListing = Listing(plan);
            const { orderDetail = {} } = planListing.getMetadata();

            return Object.values(orderDetail).map(
              (subOrder: any) => subOrder?.restaurant?.id,
            );
          }),
        );

        const allRelatedRestaurants = await fetchListingsByChunkedIds(
          flatten(allRelatedRestaurantsIdList),
          integrationSdk,
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

        const currentUserGetter = CurrentUser(currentUser);
        const { companyList = [] } = currentUserGetter.getMetadata();
        const companyId = companyList[0];
        let company;

        if (companyId) {
          company = await fetchUser(companyId);
        }
        const allPlans = flatten(allPlanListings);

        const foodsInPlans = await Promise.all(
          allPlans.map(async (plan: TListing) => {
            const planListing = Listing(plan);
            const { orderDetail: subOrders } = planListing.getMetadata();

            const pickedFoodIds: any[] = [];
            Object.keys(subOrders).forEach((key) => {
              const { memberOrders } = subOrders[key];
              if (memberOrders) {
                const foodId = memberOrders[currentUser.id.uuid]?.foodId;
                if (foodId) {
                  pickedFoodIds.push(foodId);
                }
              }
            });

            const pickedFoods: any[] = denormalisedResponseEntities(
              await sdk.listings.query({
                ids: pickedFoodIds,
                include: ['images'],
                'fields.image': [`variants.${EImageVariants.default}`],
              }),
            );

            const mapedFoodIds = pickedFoods.reduce((acc, foodListing) => {
              const id = Listing(foodListing).getId();
              if (!acc[id]) {
                acc[id] = foodListing;
              }

              return acc;
            }, {});

            return {
              planId: planListing.getId(),
              foodListings: mapedFoodIds,
            };
          }),
        );

        return res.status(200).json({
          orders,
          allPlans,
          restaurants: allRelatedRestaurants,
          mappingSubOrderToOrder,
          company,
          foodsInPlans,
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
