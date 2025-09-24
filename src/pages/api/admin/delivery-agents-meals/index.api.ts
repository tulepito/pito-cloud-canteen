import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { retrieveAllByIdChunks } from '@pages/api/company/[companyId]/ratings/index.api';
import cookies from '@services/cookie';
import { denormalisedResponseEntities } from '@services/data';
import adminChecker from '@services/permissionChecker/admin';
import { getIntegrationSdk } from '@services/sdk';
import type { OrderListing } from '@src/types';
import { EListingType } from '@src/utils/enums';

export interface GETDeliveryAgentsMealsQuery {
  page?: number;
  perPage?: number;
  filterBy?: {
    orderCode?: string;
    orderState?: string;
    startDate?: string;
    endDate?: string;
  };
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const integrationSdk = getIntegrationSdk();
  const { method } = req;
  const { JSONParams } = req.query as unknown as {
    JSONParams: string;
  };

  const { page, perPage, filterBy } = JSONParams
    ? (JSON.parse(JSONParams) as GETDeliveryAgentsMealsQuery)
    : ({} as GETDeliveryAgentsMealsQuery);

  const _page = Math.max(1, Number(page) || 1);
  const _perPage = Math.min(100, Number(perPage) || 10);

  if (method !== HttpMethod.GET) {
    return res.json({ message: 'Method not allowed' });
  }

  try {
    const orderListingsData: OrderListing[] = denormalisedResponseEntities(
      await integrationSdk.listings.query({
        meta_listingType: EListingType.order,
        ...(filterBy?.orderState
          ? { meta_orderState: filterBy?.orderState }
          : {}),
        ...(filterBy?.orderCode ? { keywords: filterBy?.orderCode } : {}),
        ...(filterBy?.startDate
          ? {
              meta_startDate: `${new Date(filterBy.startDate).valueOf() - 1},`,
            }
          : {}),
        ...(filterBy?.endDate
          ? {
              meta_endDate: `,${new Date(filterBy.endDate).valueOf() + 1}`,
            }
          : {}),
        page: _page,
        perPage: _perPage,
      }),
    );

    const planIds = orderListingsData.map(
      (order) => order.attributes?.metadata?.plans?.[0]!,
    );

    const plansData = await retrieveAllByIdChunks<OrderListing[]>(
      integrationSdk.listings.query,
      (ids) => ({
        ids,
      }),
      planIds,
      {
        meta_listingType: EListingType.subOrder,
      },
    );

    const ordersWithPlanData = orderListingsData.map((order) => ({
      ...order,
      plan: plansData.filter(
        (plan) => plan.id?.uuid === order.attributes?.metadata?.plans?.[0],
      )[0],
    }));

    res.status(200).json(ordersWithPlanData);
  } catch (error) {
    console.error('Error fetching rating listing:', error);
    res.status(500).json({ message: 'Error fetching rating listing' });
  }
};

export default cookies(adminChecker(handler));
