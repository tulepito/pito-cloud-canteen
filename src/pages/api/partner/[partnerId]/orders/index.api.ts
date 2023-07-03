import { asyncify, mapLimit } from 'async';
import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { queryAllListings } from '@helpers/apiHelpers';
import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { Listing } from '@src/utils/data';
import { EListingType, EOrderStates } from '@src/utils/enums';
import type { TPlan } from '@src/utils/orderTypes';
import type { TListing, TObject } from '@src/utils/types';

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
          const { plans = [], orderState } = Listing(order).getMetadata();

          const planId = plans[0];
          let resultValue = order as TObject;

          if (planId) {
            const [planListing] = denormalisedResponseEntities(
              (await integrationSdk.listings.show({ id: planId })) || [{}],
            );

            if (!isEmpty(planListing)) {
              resultValue = { ...resultValue, plan: planListing };
              const { orderDetail } = Listing(planListing).getMetadata();

              if (
                [
                  EOrderStates.inProgress,
                  EOrderStates.pendingPayment,
                  EOrderStates.completed,
                  EOrderStates.reviewed,
                ].includes(orderState)
              ) {
                const transactionIdMap = Object.entries<
                  TPlan['orderDetail'][keyof TPlan['orderDetail']]
                >(orderDetail).reduce<
                  { timestamp: string; transactionId: string }[]
                >((prev, [timestamp, { transactionId }]) => {
                  if (transactionId)
                    return prev.concat([{ timestamp, transactionId }]);

                  return prev;
                }, []);

                const transactionDataMap: TObject = {};
                await Promise.all(
                  transactionIdMap.map(async ({ timestamp, transactionId }) => {
                    const [tx] = denormalisedResponseEntities(
                      await integrationSdk.transactions.show({
                        id: transactionId,
                      }),
                    );

                    transactionDataMap[timestamp] = tx;
                  }),
                );
                resultValue = { ...resultValue, transactionDataMap };
              }

              return resultValue;
            }
          }

          return order;
        };

        const ordersWithPlanData = await mapLimit(
          orders,
          10,
          asyncify(orderWithPlanDataMaybe),
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
