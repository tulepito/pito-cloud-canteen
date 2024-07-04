import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  res.json({
    env: process.env.NEXT_APP_SCHEDULER_ACCESS_KEY,
  });
}

export default handler;
