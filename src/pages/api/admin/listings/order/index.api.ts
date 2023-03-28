import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { LISTING_TYPE } from '@pages/api/helpers/constants';
import cookies from '@services/cookie';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { denormalisedResponseEntities, Listing } from '@utils/data';
import { EOrderStates } from '@utils/enums';
import type { TIntegrationOrderListing, TListing } from '@utils/types';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const integrationSdk = getIntegrationSdk();

    switch (apiMethod) {
      case HttpMethod.GET:
        {
          const { JSONParams } = req.query;
          const { dataParams = {}, queryParams = {} } =
            JSON.parse(JSONParams as string) || {};

          const response = await integrationSdk.listings.query(
            {
              ...dataParams,
              meta_listingType: LISTING_TYPE.ORDER,
            },
            queryParams,
          );
          const orders = denormalisedResponseEntities(response);
          const orderWithOthersData = await Promise.all(
            orders.map(async (order: TIntegrationOrderListing) => {
              const {
                companyId,
                plans = [],
                orderState,
              } = Listing(order as TListing).getMetadata();
              const [company] = denormalisedResponseEntities(
                (await integrationSdk.users.show({
                  id: companyId,
                })) || [{}],
              );

              if (plans.length > 0) {
                const [planId] = plans;
                const [plan] = denormalisedResponseEntities(
                  await integrationSdk.listings.show({ id: planId }),
                );

                const { orderDetail: planOrderDetail } = Listing(
                  plan as TListing,
                ).getMetadata();

                const orderDetailsWithTransaction = planOrderDetail;

                if (
                  [
                    EOrderStates.inProgress,
                    EOrderStates.pendingPayment,
                    EOrderStates.completed,
                    EOrderStates.reviewed,
                  ].includes(orderState)
                ) {
                  await Promise.all(
                    Object.keys(planOrderDetail).map(async (key) => {
                      const { transactionId } = planOrderDetail[key];
                      const txResponse =
                        transactionId &&
                        (await integrationSdk.transactions.show({
                          id: transactionId,
                        }));
                      const [transaction] = txResponse
                        ? denormalisedResponseEntities(txResponse)
                        : [{}];

                      orderDetailsWithTransaction[key] = {
                        ...planOrderDetail[key],
                        transaction,
                      };
                    }),
                  );
                }

                plan.attributes.metadata.orderDetail =
                  orderDetailsWithTransaction;

                return {
                  ...order,
                  company,
                  subOrders: [plan],
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
            pagination: response.data.meta,
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
