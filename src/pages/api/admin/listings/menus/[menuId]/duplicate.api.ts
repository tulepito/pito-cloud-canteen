import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import duplicateMenu from '@pages/api/apiServices/menu/duplicateMenu.service';
import { handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    switch (req.method) {
      case HttpMethod.POST: {
        const { menuId } = req.query;
        const { dataParams, queryParams = {} } = req.body;

        const response = await duplicateMenu(
          menuId as string,
          dataParams,
          queryParams,
        );

        return res.status(200).json(response);
      }

      default:
        break;
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default handler;
