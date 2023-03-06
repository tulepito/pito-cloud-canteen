import { isEmpty } from 'lodash';

import { getIntegrationSdk } from '@services/integrationSdk';
import { denormalisedResponseEntities } from '@utils/data';
import {
  EManageCompanyOrdersTab,
  MANAGE_COMPANY_ORDERS_TAB_MAP,
} from '@utils/enums';
import type { TPlan } from '@utils/orderTypes';
import type { TCompany, TIntegrationOrderListing, TObject } from '@utils/types';

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

  const orderWithCompany = await Promise.all(
    orders.map(async (order: TIntegrationOrderListing) => {
      const { plans = [] } = order.attributes.metadata;

      if (plans.length > 0) {
        const [planId] = plans;
        const [plan] = denormalisedResponseEntities(
          await integrationSdk.listings.show({ id: planId }),
        ) as TPlan[];

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

  return { orderWithCompany, totalItemMap, queryOrdersPagination };
};
