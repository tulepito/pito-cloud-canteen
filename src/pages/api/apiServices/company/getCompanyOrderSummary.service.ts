/* eslint-disable array-callback-return */
import { queryAllListings } from '@helpers/apiHelpers';
import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/sdk';
import { IntegrationListing } from '@src/utils/data';
import { EListingType, EOrderStates } from '@src/utils/enums';
import type { TIntegrationListing } from '@src/utils/types';

const getOrders = async (companyId: string) => {
  const integrationSdk = getIntegrationSdk();

  const isProduction = process.env.NEXT_PUBLIC_ENV === 'production';
  if (isProduction) {
    return queryAllListings({
      query: {
        meta_companyId: companyId,
        meta_orderState: `${[
          EOrderStates.pendingPayment,
          EOrderStates.reviewed,
          EOrderStates.completed,
        ].join(',')}`,
        meta_listingType: EListingType.order,
      },
    });
  }
  const response = await integrationSdk.listings.query({
    meta_companyId: companyId,
    meta_orderState: `${[
      EOrderStates.pendingPayment,
      EOrderStates.reviewed,
      EOrderStates.completed,
    ].join(',')}`,
    page: 1,
    perPage: 10,
    meta_listingType: EListingType.order,
  });
  const orders = denormalisedResponseEntities(response);

  return orders;
};

const getCompanyOrderSummary = async (companyId: string) => {
  const integrationSdk = getIntegrationSdk();
  const orders = await getOrders(companyId);
  let totalOrderCost = 0;
  let totalOrderDishes = 0;
  await Promise.all(
    orders.map(async (order: TIntegrationListing) => {
      const { plans = [] } = IntegrationListing(order).getMetadata();

      await Promise.all(
        plans.map(async (planId: string) => {
          try {
            const response = await integrationSdk.listings.show({ id: planId });
            const [plan] = denormalisedResponseEntities(response);
            const { orderDetail: planOrderDetail } =
              IntegrationListing(plan).getMetadata();
            Object.keys(planOrderDetail).map((key) => {
              const { foodList = {} } = planOrderDetail[key].restaurant;
              totalOrderDishes =
                Object.keys(foodList).length + totalOrderDishes;
              Object.keys(foodList).map((foodId) => {
                totalOrderCost += foodList[foodId].foodPrice;
              });
            });
          } catch (error) {
            console.error(error);
          }
        }),
      );
    }),
  );

  return { totalOrderDishes, totalOrderCost };
};

export default getCompanyOrderSummary;
