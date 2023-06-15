import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import {
  fetchTransaction,
  updateTransactionMetadata,
} from '@services/integrationHelper';
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

      case HttpMethod.POST:
        return res.status(404).json({ message: 'Method is not allow' });
      case HttpMethod.DELETE:
        return res.status(404).json({ message: 'Method is not allow' });
      case HttpMethod.PUT: {
        try {
          const transaction = await updateTransactionMetadata({
            id: transactionId,
            metadata: {},
          });

          return res.status(200).json(transaction);
        } catch (error) {
          return handleError(res, error);
        }
      }
      default:
        return res.status(404).json({ message: 'Method is not allow' });
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default handler;
