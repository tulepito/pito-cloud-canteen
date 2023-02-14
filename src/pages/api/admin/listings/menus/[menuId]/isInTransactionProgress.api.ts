/* eslint-disable no-console */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import cookies from '@services/cookie';
import { deserialize, getIntegrationSdk, handleError } from '@services/sdk';
import { EListingType, EOrderStates } from '@utils/enums';
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
    const { queryParams = {} } = req.body;
    const { menuId } = req.query;
    const intergrationSdk = getIntegrationSdk();
    const response = await intergrationSdk.listings.query(
      {
        meta_menuIds: menuId,
        meta_listingType: EListingType.transaction,
        meta_orderState: [EOrderStates.inProgress, EOrderStates.picking],
      },
      queryParams,
    );
    const { totalItems } = response.data.meta;
    const isInTransactionProgress = totalItems.length > 0;
    return res.json({ isInTransactionProgress });
  } catch (error) {
    console.log(error);
    handleError(res, error);
  }
}

export default cookies(handler);
