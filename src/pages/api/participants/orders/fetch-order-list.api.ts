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
import { getEndOfMonth } from '@src/utils/dates';
import type { TListing } from '@src/utils/types';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const sdk = getSdk(req, res);
    const integrationSdk = getIntegrationSdk();

    switch (apiMethod) {
      case HttpMethod.GET: {
        const { JSONParams } = req.query;
        const { selectedMonth } = JSON.parse(JSONParams as string);
        const currentUser = denormalisedResponseEntities(
          await sdk.currentUser.show(),
        )[0];

        const ordersQueries = getParticipantOrdersQueries({
          userId: currentUser.id.uuid,
          startDate: new Date(selectedMonth).getTime(),
          endDate: getEndOfMonth(new Date(selectedMonth)).getTime(),
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
        const allPlans = await fetchListingsByChunkedIds(
          allPlansIdList,
          integrationSdk,
        );

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

        return res.status(200).json({
          orders,
          allPlans: flatten(allPlans),
          restaurants: allRelatedRestaurants,
          mappingSubOrderToOrder,
          company,
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
