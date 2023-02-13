/* eslint-disable no-console */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import cookies from '@services/cookie';
import { deserialize, getIntegrationSdk, handleError } from '@services/sdk';
import { LISTING_TYPE } from '@src/pages/api/helpers/constants';
import { denormalisedResponseEntities } from '@utils/data';
import { EListingType } from '@utils/enums';
import type { TCompany, TIntegrationOrderListing } from '@utils/types';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    if (
      req.headers['content-type'] === 'application/transit+json' &&
      typeof req.body === 'string'
    ) {
      try {
        req.body = deserialize(req.body);
      } catch (e) {
        console.error('Failed to parse request body as Transit:');
        console.error(e);
        res.status(400).send('Invalid Transit in request body.');
        return;
      }
    }
    const { dataParams = {}, queryParams = {} } = req.body;
    const integrationSdk = getIntegrationSdk();
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
        const { companyId, bookerId } = order.attributes.metadata;

        const [bookerUserResponse, companyUserResponse] = await Promise.all([
          integrationSdk.users.show({
            id: bookerId,
          }),
          integrationSdk.users.show({
            id: companyId,
          }),
        ]);

        const subOrderResponse = await integrationSdk.listings.query({
          meta_orderId: order.id.uuid,
          meta_listingType: EListingType.subOrder,
        });
        const subOrders = denormalisedResponseEntities(subOrderResponse);
        const [company] = denormalisedResponseEntities(
          companyUserResponse,
        ) as TCompany[];
        const [booker] = denormalisedResponseEntities(bookerUserResponse);
        return {
          ...order,
          company,
          subOrders,
          booker,
        };
      }),
    );

    res.json({
      orders: orderWithCompanyAndSubOrders,
      pagination: response.data.meta,
    });
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(handler);
