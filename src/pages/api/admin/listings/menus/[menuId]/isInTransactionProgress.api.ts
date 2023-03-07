import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { EListingType, EOrderStates } from '@utils/enums';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { queryParams = {} } = req.body;
    const { menuId } = req.query;
    const integrationSdk = getIntegrationSdk();
    const response = await integrationSdk.listings.query(
      {
        meta_menuIds: menuId,
        meta_listingType: EListingType.subOrder,
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
