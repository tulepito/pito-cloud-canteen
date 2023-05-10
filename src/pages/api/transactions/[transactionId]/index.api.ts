import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import { fetchTransaction } from '@services/integrationHelper';
import { handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { transactionId } = req.query;
  try {
    const tx = await fetchTransaction(transactionId as string);
    res.json(tx);
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(handler);
