import uniq from 'lodash/uniq';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { queryAllPages } from '@helpers/apiHelpers';
import { LISTING_TYPE } from '@pages/api/helpers/constants';
import cookies from '@services/cookie';
import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { denormalisedResponseEntities, Listing, User } from '@utils/data';
import type { TIntegrationOrderListing, TListing } from '@utils/types';

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
                  meta_listingType: LISTING_TYPE.ORDER,
                },
              })
            : await integrationSdk.listings.query(
                {
                  ...dataParams,
                  meta_listingType: LISTING_TYPE.ORDER,
                },
                queryParams,
              );
          const orders = isQueryAllPages
            ? isProduction
              ? response
              : response.slice(0, 20)
            : denormalisedResponseEntities(response);
          const orderWithOthersData = await Promise.all(
            orders.map(async (order: TIntegrationOrderListing) => {
              const {
                companyId,
                plans = [],
                bookerId,
              } = Listing(order as TListing).getMetadata();
              const company = await fetchUser(companyId);

              if (plans.length > 0) {
                const [planId] = plans;
                const [plan] = denormalisedResponseEntities(
                  await integrationSdk.listings.show({ id: planId }),
                );

                const { orderDetail: planOrderDetail } = Listing(
                  plan as TListing,
                ).getMetadata();

                const allRestaurantsIds = uniq(
                  Object.values(planOrderDetail).map(
                    (orderDetail: any) => orderDetail.restaurant.id,
                  ),
                );

                const allRestaurants = await Promise.all(
                  allRestaurantsIds.map(async (restaurantId) => {
                    const [restaurant] = denormalisedResponseEntities(
                      await integrationSdk.listings.show({
                        id: restaurantId,
                      }),
                    );

                    return restaurant;
                  }),
                );
                let bookerName = '';
                if (bookerId === companyId) {
                  const companyUser = User(company);
                  const { firstName, lastName } = companyUser.getProfile();
                  bookerName = `${lastName} ${firstName}`;
                } else {
                  const booker = await fetchUser(bookerId);
                  const bookerUser = User(booker);
                  const { firstName, lastName } = bookerUser.getProfile();
                  bookerName = `${lastName} ${firstName}`;
                }

                return {
                  ...order,
                  company,
                  subOrders: [plan],
                  allRestaurants,
                  bookerName,
                };
              }

              return {
                ...order,
                company,
                subOrders: [],
              };
            }),
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
