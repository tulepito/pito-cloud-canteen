import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { fetchTransaction } from '@services/integrationHelper';
import { handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const { transactionId } = req.query;

    switch (apiMethod) {
      case HttpMethod.GET:
        try {
          const tx = await fetchTransaction(transactionId as string);

          return res.json(tx);
        } catch (error) {
          return handleError(res, error);
        }

      default:
        return res.status(400).json({ message: 'Method is not allow' });
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default handler;
