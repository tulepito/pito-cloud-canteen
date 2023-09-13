/* eslint-disable @typescript-eslint/no-shadow */
import compact from 'lodash/compact';
import flatten from 'lodash/flatten';
import uniq from 'lodash/uniq';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { convertListIdToQueries, queryAllPages } from '@helpers/apiHelpers';
import cookies from '@services/cookie';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { EListingType } from '@src/utils/enums';
import { denormalisedResponseEntities, Listing, User } from '@utils/data';
import type {
  TIntegrationOrderListing,
  TListing,
  TObject,
  TUser,
} from '@utils/types';

const { NEXT_PUBLIC_ENV } = process.env;
const isProduction = NEXT_PUBLIC_ENV === 'production';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const integrationSdk = getIntegrationSdk();

    switch (apiMethod) {
      case HttpMethod.GET:
        {
          const { JSONParams } = req.query;
          const {
            dataParams = {},
            queryParams = {},
            isQueryAllPages = false,
          } = JSON.parse(JSONParams as string) || {};

          const response = isQueryAllPages
            ? await queryAllPages({
                sdkModel: integrationSdk.listings,
                query: {
                  ...dataParams,
                  meta_listingType: EListingType.order,
                },
              })
            : await integrationSdk.listings.query(
                {
                  ...dataParams,
                  meta_listingType: EListingType.order,
                },
                queryParams,
              );

          const orders = isQueryAllPages
            ? isProduction
              ? response
              : response.slice(0, 20)
            : denormalisedResponseEntities(response);

          // TODO: query plan(s) for mapping with orders
          // #region query plan(s)
          let allPlans: TListing[] = [];

          if (isProduction && isQueryAllPages) {
            allPlans = await queryAllPages({
              sdkModel: integrationSdk.listings,
              query: {
                meta_listingType: EListingType.subOrder,
              },
            });
          } else {
            const allPlanIds = compact(
              orders.map((order: TListing) => {
                const { plans = [] } = Listing(order).getMetadata();

                return plans[0];
              }),
            );

            allPlans = denormalisedResponseEntities(
              await integrationSdk.listings.query({
                ids: allPlanIds,
              }),
            );
          }
          // #endregion query plan(s)

          // TODO: query restaurant(s) for mapping with orders
          // #region query restaurant(s)
          const allRestaurantIds = uniq(
            compact(
              allPlans.reduce<Array<string | undefined>>(
                (restaurantIdList, plan: TListing) => {
                  const { orderDetail = {} } = Listing(plan).getMetadata();

                  const newIds: Array<string | undefined> = Object.values(
                    orderDetail,
                  ).map((_orderDetail: any) => _orderDetail?.restaurant?.id);

                  return restaurantIdList.concat(newIds);
                },
                [],
              ),
            ),
          );
          const restaurantQueries = convertListIdToQueries({
            idList: allRestaurantIds,
          });
          const allRestaurants: TListing[] = flatten(
            await Promise.all(
              restaurantQueries.map(async ({ ids }) => {
                return denormalisedResponseEntities(
                  await integrationSdk.listings.query({
                    ids: `${ids}`,
                  }),
                );
              }),
            ),
          );
          // #endregion query restaurant(s)

          // TODO: query company(ies)/booker(s) for mapping with orders
          // #region query company(ies)/booker(s)
          let allCompanies: TUser[] = [];
          let allBookers: TUser[] = [];

          const { companyIds, bookerIds } = orders.reduce(
            (result: TObject, order: TListing) => {
              const { companyId, bookerId } = Listing(order).getMetadata();

              return {
                companyIds: result.companyIds.concat(companyId),
                bookerIds: result.bookerIds.concat(bookerId),
              };
            },
            {
              companyIds: [],
              bookerIds: [],
            },
          );
          const allCompanyIds = uniq(compact(companyIds));
          const allBookerIds = uniq(compact(bookerIds));

          if (isProduction && isQueryAllPages) {
            const companyQueries = convertListIdToQueries({
              idList: allCompanyIds,
            });
            allCompanies = flatten(
              await Promise.all(
                companyQueries.map(async ({ ids }) => {
                  return denormalisedResponseEntities(
                    await integrationSdk.users.query({
                      meta_id: `${ids}`,
                    }),
                  );
                }),
              ),
            );

            const bookerQueries = convertListIdToQueries({
              idList: allBookerIds,
            });
            allBookers = flatten(
              await Promise.all(
                bookerQueries.map(async ({ ids }) => {
                  return denormalisedResponseEntities(
                    await integrationSdk.users.query({
                      meta_id: `${ids}`,
                    }),
                  );
                }),
              ),
            );
          } else {
            allCompanies = denormalisedResponseEntities(
              await integrationSdk.users.query({
                meta_id: allCompanyIds,
              }),
            );
            allBookers = denormalisedResponseEntities(
              await integrationSdk.users.query({
                meta_id: allBookerIds,
              }),
            );
          }
          // #endregion query company(ies)/booker(s)

          const orderWithOthersData = orders.map(
            (order: TIntegrationOrderListing) => {
              const {
                companyId,
                plans = [],
                bookerId,
              } = Listing(order as TListing).getMetadata();
              const company = allCompanies.find((c) => c.id.uuid === companyId);
              const booker = allBookers.find((b) => b.id.uuid === bookerId);

              if (plans.length > 0) {
                const [planId] = plans;
                const plan = allPlans.find((p) => p.id.uuid === planId);

                const { orderDetail: planOrderDetail } = Listing(
                  plan as TListing,
                ).getMetadata();

                const restaurantsIds = uniq(
                  Object.values(planOrderDetail).map(
                    (orderDetail: any) => orderDetail?.restaurant?.id,
                  ),
                );
                const restaurants = allRestaurants.filter((r: TListing) =>
                  restaurantsIds.includes(r.id.uuid),
                );

                const { firstName, lastName } = User(
                  bookerId === companyId ? company! : booker!,
                ).getProfile();
                const bookerName = `${lastName} ${firstName}`;

                return {
                  ...order,
                  company,
                  subOrders: [plan],
                  allRestaurants: restaurants,
                  bookerName,
                };
              }

              return {
                ...order,
                company,
                subOrders: [],
              };
            },
          );

          res.json({
            orders: orderWithOthersData,
            ...(!isQueryAllPages && {
              pagination: response.data.meta,
            }),
          });
        }
        break;
      default:
        break;
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(handler);
