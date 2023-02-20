// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import cookies from '@services/cookie';
import { getIntegrationSdk } from '@services/integrationSdk';
import { handleError } from '@services/sdk';
import { denormalisedResponseEntities } from '@utils/data';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { emails = '', queryParams = {} } = req.query as unknown as {
      emails: string;
      queryParams: Record<string, string>;
    };
    const emailsSplitted = emails.split(',');

    const emailsAsArray = Array.isArray(emailsSplitted)
      ? emailsSplitted
      : [emailsSplitted];

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
