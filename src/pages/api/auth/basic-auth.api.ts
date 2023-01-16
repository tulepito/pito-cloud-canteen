import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
  res.status(401);
  res.end('Auth Request');
}

export default handler;
