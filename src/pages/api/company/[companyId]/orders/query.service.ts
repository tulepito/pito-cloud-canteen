import { isEmpty } from 'lodash';

import { getIntegrationSdk } from '@services/integrationSdk';
import { denormalisedResponseEntities, Listing } from '@utils/data';
import {
  EManageCompanyOrdersTab,
  EOrderStates,
  MANAGE_COMPANY_ORDERS_TAB_MAP,
} from '@utils/enums';
import type {
  TCompany,
  TIntegrationOrderListing,
  TListing,
  TObject,
} from '@utils/types';

export const queryCompanyOrders = async ({
  companyId,
  dataParams,
  queryParams,
}: {
  companyId: string;
  dataParams: TObject;
  queryParams: TObject;
}) => {
  const integrationSdk = getIntegrationSdk();

  const initOrderStatesToQuery =
    MANAGE_COMPANY_ORDERS_TAB_MAP[EManageCompanyOrdersTab.ALL].join(',');
  const {
    meta_orderState: orderStateFromParams,
    currentTab = EManageCompanyOrdersTab.ALL,
    page,
  } = dataParams;

  const queryOrdersResponse = await integrationSdk.listings.query(
    isEmpty(orderStateFromParams)
      ? {
          ...dataParams,
          meta_orderState: initOrderStatesToQuery,
        }
      : dataParams,
    queryParams,
  );
  const queryOrdersPagination = queryOrdersResponse.data.meta;
  const { totalItems = 0, totalPages = 1 } = queryOrdersResponse.data.meta;

  const [company] = denormalisedResponseEntities(
    await integrationSdk.users.show({
      id: companyId,
    }),
  ) as TCompany[];
  const orders = denormalisedResponseEntities(queryOrdersResponse);

  const orderWithOthersData = await Promise.all(
    orders.map(async (order: TIntegrationOrderListing) => {
      const { plans = [], orderState } = Listing(
        order as TListing,
      ).getMetadata();

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

        plan.attributes.metadata.orderDetail = orderDetailsWithTransaction;

        return {
          ...order,
          company,
          plan,
        };
      }

      return {
        ...order,
        company,
      };
    }),
  );

  const totalItemMap: TObject = {
    [currentTab]: page > totalPages ? 0 : totalItems,
  };

  const queryStates = Object.entries(MANAGE_COMPANY_ORDERS_TAB_MAP).reduce<
    string[][]
  >((prev, [key, states]) => {
    if (key !== currentTab) {
      const newList = [key, states.join(',')];

      return prev.concat([newList]);
    }
    return prev;
  }, []);

  const paramList = queryStates.reduce<TObject[]>(
    (previousList, [key, parsedStates]) =>
      previousList.concat([
        {
          ...dataParams,
          meta_orderState: parsedStates,
          tab: key,
        },
      ]),
    [],
  );

  await Promise.all(
    paramList.map(async (params) => {
      const { tab, ...restParams } = params;
      const orderResponse = await integrationSdk.listings.query(restParams);
      const { totalPages: resTotalPages = 1, totalItems: resTotalItems = 0 } =
        orderResponse.data.meta;

      totalItemMap[tab] = page > resTotalPages ? 0 : resTotalItems;
    }),
  );

  return {
    orderWithCompany: orderWithOthersData,
    totalItemMap,
    queryOrdersPagination,
  };
};
