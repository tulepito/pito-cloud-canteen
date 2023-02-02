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
    const integrationSdk = getIntegrationSdk();
    const { dataParams = {}, queryParams = {} } = req.body;
    // eslint-disable-next-line unused-imports/no-unused-vars
    const { needQueryAllStates = false, ...restDataParams } = dataParams;

    const newDataParams = {
      ...restDataParams,
      meta_listingType: LISTING_TYPE.ORDER,
    };
    const response = await integrationSdk.listings.query(
      newDataParams,
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

    // if (needQueryAllStates) {
    //   const queryStates = [
    //     EOrderStates.picking,
    //     EOrderStates.completed,
    //     EOrderStates.isNew,
    //     EOrderStates.canceled,
    //   ];

    //   const orderCounts = await Promise.all(
    //     queryStates.map(async (state) => {
    //       const params = {
    //         ...newDataParams,
    //         meta_orderState: state,
    //       };
    //       const orderResponse = await integrationSdk.listings.query(params);

    //       console.log(state, orderResponse.data.meta.totalItems);
    //     }),
    //   );
    // }
    res.json({ orders: orderWithCompany, pagination: response.data.meta });
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(handler);
