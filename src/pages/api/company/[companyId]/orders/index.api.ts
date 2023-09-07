import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import { handleError } from '@services/sdk';

import { queryCompanyOrders } from './query.service';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const apiMethod = req.method;

  switch (apiMethod) {
    case 'GET':
      try {
        const { companyId, JSONParams } = req.query;
        const { dataParams = {}, queryParams = {} } = JSON.parse(
          JSONParams as string,
        );

        const { response } = await queryCompanyOrders({
          companyId: companyId as string,
          dataParams,
          queryParams,
        });

        return res.json(response);
      } catch (error) {
        handleError(res, error);
      }
      break;

    default:
      break;
  }
}

export default cookies(handler);
