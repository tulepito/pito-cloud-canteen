/* eslint-disable no-console */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import cookies from '@services/cookie';
import { handleError } from '@services/sdk';
import type { NextApiRequest, NextApiResponse } from 'next';

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

        const { orderWithCompany, totalItemMap, queryOrdersPagination } =
          await queryCompanyOrders({
            companyId: companyId as string,
            dataParams,
            queryParams,
          });

        res.json({
          orders: orderWithCompany,
          pagination: queryOrdersPagination,
          totalItemMap,
        });
      } catch (error) {
        handleError(res, error);
      }
      break;
    case 'POST':
      break;
    default:
      break;
  }
}

export default cookies(handler);
