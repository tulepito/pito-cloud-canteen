import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import adminChecker from '@services/permissionChecker/admin';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { LISTING_TYPE } from '@src/pages/api/helpers/constants';
import { denormalisedResponseEntities } from '@utils/data';
import { EListingType, EOrderDraftStates, EOrderStates } from '@utils/enums';
import type { TCompany, TIntegrationOrderListing } from '@utils/types';

const AdminOrderStatesEnableToQuery = [
  ...Object.values(EOrderStates),
  ...Object.values(EOrderDraftStates),
  // EBookerOrderDraftStates.bookerDraft,
];

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { dataParams = {}, queryParams = {} } = req.body;
    const integrationSdk = getIntegrationSdk();
    const response = await integrationSdk.listings.query(
      {
        ...dataParams,
        meta_listingType: LISTING_TYPE.ORDER,
        meta_orderState: AdminOrderStatesEnableToQuery.join(','),
      },
      queryParams,
    );
    const orders = denormalisedResponseEntities(response);

    const orderWithCompanyAndSubOrders = await Promise.all(
      orders.map(async (order: TIntegrationOrderListing) => {
        const { companyId, bookerId } = order.attributes.metadata;

        const [bookerUserResponse, companyUserResponse] = await Promise.all([
          integrationSdk.users.show({
            id: bookerId,
          }),
          integrationSdk.users.show({
            id: companyId,
          }),
        ]);
        const [company] = denormalisedResponseEntities(
          companyUserResponse,
        ) as TCompany[];
        const [booker] = denormalisedResponseEntities(bookerUserResponse);

        const subOrderResponse = await integrationSdk.listings.query({
          meta_orderId: order.id.uuid,
          meta_listingType: EListingType.subOrder,
        });

        const subOrders = denormalisedResponseEntities(subOrderResponse);

        const subOrdersWithTransaction = await Promise.all(
          subOrders.map(async (subOrder: TIntegrationOrderListing) => {
            const { orderDetail } = subOrder.attributes.metadata;

            let orderDetailsWithTransaction = {};
            await Promise.all(
              Object.keys(orderDetail).map(async (key) => {
                const { transactionId } = orderDetail[key];
                const txResponse =
                  transactionId &&
                  (await integrationSdk.transactions.show({
                    id: transactionId,
                  }));
                const [transaction] = txResponse
                  ? denormalisedResponseEntities(txResponse)
                  : [{}];

                orderDetailsWithTransaction = {
                  ...orderDetailsWithTransaction,
                  [key]: {
                    ...orderDetail[key],
                    transaction,
                  },
                };
              }),
            );

            return {
              ...subOrder,
              attributes: {
                ...subOrder.attributes,
                metadata: {
                  ...subOrder.attributes.metadata,
                  orderDetail: orderDetailsWithTransaction,
                },
              },
            };
          }),
        );
        return {
          ...order,
          company,
          subOrders: subOrdersWithTransaction,
          booker,
        };
      }),
    );

    return res.json({
      orders: orderWithCompanyAndSubOrders,
      pagination: response.data.meta,
    });
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(adminChecker(handler));
