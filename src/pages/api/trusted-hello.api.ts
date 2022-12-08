// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import cookies from '@services/cookie';
import { getTrustedSdk, handleError } from '@services/sdk';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { userId } = req.query;
  try {
    const sdk = await getTrustedSdk(req);
    const user = await sdk.users.show({
      id: userId,
    });
    res.json({ user });
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(handler);
