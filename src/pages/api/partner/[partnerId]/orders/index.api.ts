import { asyncify, mapLimit } from 'async';
import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { queryAllListings, queryAllTransactions } from '@helpers/apiHelpers';
import { fetchListing } from '@services/integrationHelper';
import { handleError } from '@services/sdk';
import { Listing, Transaction } from '@src/utils/data';
import { EListingType, EOrderStates } from '@src/utils/enums';
import type { TPlan } from '@src/utils/orderTypes';
import type { TListing, TObject, TTransaction } from '@src/utils/types';

const SHOULD_HAVE_TRANSACTION_STATES = [
  EOrderStates.inProgress,
  EOrderStates.pendingPayment,
  EOrderStates.completed,
  EOrderStates.reviewed,
];

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const {
      method: apiMethod,
      query: { partnerId },
    } = req;

    switch (apiMethod) {
      case HttpMethod.GET: {
        const orders = await queryAllListings({
          query: {
            meta_partnerIds: `has_any:${partnerId}`,
            meta_listingType: EListingType.order,
          },
        });
        const transactions = await queryAllTransactions({
          query: {
            listingId: partnerId,
          },
        });

        const transactionMap = transactions.reduce(
          (map: TObject<string, TTransaction>, tx: TTransaction) => ({
            ...map,
            [Transaction(tx).getId()]: tx,
          }),
          {},
        );

        const orderWithPlanDataMaybe = async (order: TListing) => {
          const { plans = [], orderState } = Listing(order).getMetadata();

          const planId = plans[0];
          let resultValue = order as TObject;

          if (planId) {
            const planListing = await fetchListing(planId);

            if (!isEmpty(planListing)) {
              resultValue = { ...resultValue, plan: planListing };
              const { orderDetail } = Listing(planListing).getMetadata();

              if (SHOULD_HAVE_TRANSACTION_STATES.includes(orderState)) {
                const transactionDataMap: TObject = {};
                Object.entries<
                  TPlan['orderDetail'][keyof TPlan['orderDetail']]
                >(orderDetail).forEach(([timestamp, { transactionId }]) => {
                  if (transactionId) {
                    transactionDataMap[timestamp] =
                      transactionMap[transactionId];
                  }
                });

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
