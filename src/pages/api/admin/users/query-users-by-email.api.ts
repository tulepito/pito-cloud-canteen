// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

import queryUserByEmail from '@pages/api/apiServices/user/queryUserByEmail.service';
import cookies from '@services/cookie';
import { handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { JSONParams } = req.query as unknown as {
      JSONParams: string;
    };
    const { dataParams = {}, queryParams = {} } = JSON.parse(JSONParams);
    const { emails } = dataParams;
    const users = await queryUserByEmail(emails, queryParams);
    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(handler);
