import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { LISTING_TYPE } from '@pages/api/helpers/constants';
import cookies from '@services/cookie';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { denormalisedResponseEntities } from '@utils/data';
import { EListingType } from '@utils/enums';
import type { TCompany, TIntegrationOrderListing } from '@utils/types';

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
          const orderWithCompanyAndSubOrders = await Promise.all(
            orders.map(async (order: TIntegrationOrderListing) => {
              const { companyId } = order.attributes.metadata;
              const companyUserResponse = await integrationSdk.users.show({
                id: companyId,
              });
              const subOrderResponse = await integrationSdk.listings.query({
                meta_orderId: order.id.uuid,
                meta_listingType: EListingType.subOrder,
              });
              const subOrders = denormalisedResponseEntities(subOrderResponse);
              const [company] = denormalisedResponseEntities(
                companyUserResponse,
              ) as TCompany[];
              return {
                ...order,
                company,
                subOrders,
              };
            }),
          );

          res.json({
            orders: orderWithCompanyAndSubOrders,
            pagination: response.data.meta,
          });
        }
        break;
      case HttpMethod.POST:
        break;
      case HttpMethod.DELETE:
        break;
      case HttpMethod.PUT:
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
