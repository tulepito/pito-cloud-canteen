import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import { handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.query;
    const response = await axios.get(url as string, {
      responseType: 'arraybuffer',
    });
    res.setHeader('Content-Type', response.headers['content-type'] as string);
    res.send(response.data);
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(handler);
