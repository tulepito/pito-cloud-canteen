import type { NextApiRequest, NextApiResponse } from 'next';

import checkIsInTransactionProgressMenu from '@pages/api/apiServices/menu/checkIsInTransactionProgressMenu.service';
import cookies from '@services/cookie';
import { handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { menuId } = req.query;
    const { queryParams = {} } = req.body;
    const isInTransactionProgress = await checkIsInTransactionProgressMenu(
      menuId as string,
      queryParams,
    );

    return res.json({ isInTransactionProgress });
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(handler);
