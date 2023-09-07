import { isEmpty } from 'lodash';

import { getIntegrationSdk } from '@services/integrationSdk';
import { denormalisedResponseEntities } from '@utils/data';
import {
  EManageCompanyOrdersTab,
  MANAGE_COMPANY_ORDERS_TAB_MAP,
} from '@utils/enums';
import type { TObject } from '@utils/types';

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
  const { meta_orderState: orderStateFromParams } = dataParams;

  if (!companyId) {
    throw new Error('Company id is required');
  }

  const [company] = denormalisedResponseEntities(
    await integrationSdk.users.show({ id: companyId }),
  );

  if (!company.id) {
    throw new Error('Company not found');
  }

  const queryOrdersResponse = await integrationSdk.listings.query(
    isEmpty(orderStateFromParams)
      ? {
          ...dataParams,
          meta_orderState: initOrderStatesToQuery,
        }
      : dataParams,
    queryParams,
  );

  const orders = denormalisedResponseEntities(queryOrdersResponse);

  return {
    orders,
    response: queryOrdersResponse,
  };
};
