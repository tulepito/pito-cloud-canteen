// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import { getIntegrationSdk } from '@services/integrationSdk';
import { handleError } from '@services/sdk';
import { denormalisedResponseEntities } from '@utils/data';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { JSONParams } = req.query as unknown as {
      JSONParams: string;
    };
    const { dataParams = {}, queryParams = {} } = JSON.parse(JSONParams);

    const { emails } = dataParams;

    const emailsAsArray = Array.isArray(emails) ? emails : [emails];
    const intergrationSdk = getIntegrationSdk();

    const users = await Promise.all(
      emailsAsArray.map(async (email: string) => {
        const response = await intergrationSdk.users.show(
          { email },
          queryParams,
        );
        const [user] = denormalisedResponseEntities(response);
        return user;
      }),
    );

    return res.send(users);
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(handler);
