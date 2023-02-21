// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import cookies from '@services/cookie';
import { getSdk } from '@services/sdk';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { userId } = req.body;
  const sdk = getSdk(req, res);
  const user = await sdk.users.show({
    id: userId,
  });
  res.json({ user });
}

export default cookies(handler);
