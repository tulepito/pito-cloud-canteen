import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { queryAllPartnerPaymentRecordsOnFirebase } from '@services/payment';
import { handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const {
    method: apiMethod,
    query: { partnerId },
  } = req;
  try {
    switch (apiMethod) {
      case HttpMethod.GET: {
        const paymentRecords = await queryAllPartnerPaymentRecordsOnFirebase({
          partnerId,
        });

        return res.json(paymentRecords);
      }

      default:
        break;
    }
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(handler);
