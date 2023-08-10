import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { queryAllPartnerPaymentRecordsOnFirebase } from '@services/payment';
import { handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const apiMethod = req.method;
  try {
    switch (apiMethod) {
      case HttpMethod.GET:
        {
          const paymentRecords =
            await queryAllPartnerPaymentRecordsOnFirebase();

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

export default cookies(handler);
