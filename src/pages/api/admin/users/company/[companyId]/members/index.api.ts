// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import adminChecker from '@services/permissionChecker/admin';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { denormalisedResponseEntities, User } from '@utils/data';
import type { TUser } from '@utils/types';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { companyId, page = 1, perPage = 10 } = req.query;

    const intergrationSdk = getIntegrationSdk();
    const response = await intergrationSdk.users.show(
      {
        id: companyId,
      },
      { expand: true },
    );

    const [company] = denormalisedResponseEntities(response);

    const { members = {} } = User(company).getMetadata();

    const queryResponse = await intergrationSdk.users.query({
      meta_companyList: companyId,
      page,
      perPage,
    });

    const users = denormalisedResponseEntities(queryResponse);
    const membersWithDetails = users.map((user: TUser) => {
      const key = Object.keys(members).find(
        (email) => email === user.attributes.email,
      );
      return { ...user, ...(key ? { ...members[key] } : {}) };
    });

    return res.json(membersWithDetails);
  } catch (error) {
    return handleError(res, error);
  }
}

export default cookies(adminChecker(handler));
