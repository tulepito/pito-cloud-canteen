/* eslint-disable no-console */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import cookies from '@services/cookie';
import { deserialize, getIntegrationSdk, handleError } from '@services/sdk';
import { LISTING_TYPE } from '@src/pages/api/helpers/constants';
import { denormalisedResponseEntities } from '@utils/data';
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
    const orderWithCompany = await Promise.all(
      orders.map(async (order: TIntegrationOrderListing) => {
        const { companyId } = order.attributes.metadata;
        const companyUserResponse = await integrationSdk.users.show({
          id: companyId,
        });
        const [company] = denormalisedResponseEntities(
          companyUserResponse,
        ) as TCompany[];
        return {
          ...order,
          company,
        };
      }),
    );

    res.json({ orders: orderWithCompany, pagination: response.data.meta });
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(handler);
