import { HttpMethod } from '@apis/configs';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const apiMethod = req.method;

  switch (apiMethod) {
    case HttpMethod.GET:
      return res.send('Hello participant order API');
    default:
      break;
  }
};

export default handler;
