import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { queryClientPaymentRecordsOnFirebase } from '@services/payment';
import companyChecker from '@services/permissionChecker/company';
import { handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const apiMethod = req.method;
  try {
    switch (apiMethod) {
      case HttpMethod.GET:
        {
          const { JSONParams } = req.query;
          const { dataParams } = JSON.parse(JSONParams as string) || {};
          const { orderIds } = dataParams;
          const paymentRecords = await queryClientPaymentRecordsOnFirebase({
            orderIds,
          });

          res.json(paymentRecords);
        }
        break;
      default:
        break;
    }
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(companyChecker(handler));
