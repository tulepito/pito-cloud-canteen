import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { queryCompanyPaymentRecordOnFirebase } from '@services/payment';
import { handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const apiMethod = req.method;
  try {
    switch (apiMethod) {
      case HttpMethod.GET: {
        const { JSONParams } = req.query;
        const { lastPaymentRecord } = JSON.parse(JSONParams as string);
        const paymentRecords = await queryCompanyPaymentRecordOnFirebase({
          limitRecords: 100,
          lastRecord: lastPaymentRecord,
        });

        return res.status(200).json(paymentRecords);
      }
      default:
        return res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(handler);
