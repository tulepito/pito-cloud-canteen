// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import cookies from '@services/cookie';
import { getIntegrationSdk, handleError } from '@services/sdk';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { companyId } = req.query;
    const intergrationSdk = getIntegrationSdk();
    const response = await intergrationSdk.users.show(
      {
        id: companyId,
        include: ['profileImage'],
      },
      { expand: true },
    );
    res.json(response);
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(handler);
