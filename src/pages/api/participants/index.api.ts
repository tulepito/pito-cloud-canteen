import type { NextApiRequest, NextApiResponse } from 'next';

import { HTTP_METHODS } from '../helpers/constants';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const apiMethod = req.method;

  switch (apiMethod) {
    case HTTP_METHODS.GET:
      return res.send('Hello participant order API');
      break;
    default:
      break;
  }
};

export default handler;
