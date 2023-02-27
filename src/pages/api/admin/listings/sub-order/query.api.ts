import cookies from '@services/cookie';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { LISTING_TYPE } from '@src/pages/api/helpers/constants';
import { denormalisedResponseEntities } from '@utils/data';
import type { TIntegrationOrderListing } from '@utils/types';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { dataParams = {}, queryParams = {} } = req.body;

    const integrationSdk = getIntegrationSdk();
    const response = await integrationSdk.listings.query(
      {
        ...dataParams,
        meta_listingType: LISTING_TYPE.SUB_ORDER,
      },
      queryParams,
    );
    const subOrders = denormalisedResponseEntities(response);
    const orderWithCompany = await Promise.all(
      subOrders.map(async (subOrder: TIntegrationOrderListing) => {
        const { orderId } = subOrder.attributes.metadata;
        const orderResponse = await integrationSdk.listings.show({
          id: orderId,
        });
        const [order] = denormalisedResponseEntities(orderResponse);
        const { companyId } = order.attributes.metadata;
        const companyResponse = await integrationSdk.users.show({
          id: companyId,
        });
        const [company] = denormalisedResponseEntities(companyResponse);
        return {
          ...subOrder,
          company,
          order,
        };
      }),
    );

    res.json({ subOrders: orderWithCompany, pagination: response.data.meta });
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(handler);
