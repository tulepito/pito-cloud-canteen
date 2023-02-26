import cookies from '@services/cookie';
import { fetchUser } from '@services/integrationHelper';
import { handleError } from '@services/sdk';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { userId } = req.query;
  try {
    const user = await fetchUser(userId as string);
    res.json(user);
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(handler);
