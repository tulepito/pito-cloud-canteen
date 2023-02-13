// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import cookies from '@services/cookie';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { denormalisedResponseEntities, USER } from '@utils/data';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { companyId, roles: rolesAsString = '' } = req.query;
    const intergrationSdk = getIntegrationSdk();
    const response = await intergrationSdk.users.show(
      {
        id: companyId,
      },
      { expand: true },
    );

    const [company] = denormalisedResponseEntities(response);

    const { members = {} } = USER(company).getMetadata();

    const roles = String(rolesAsString).split(',');

    const membersWithRoles = rolesAsString
      ? Object.keys(members)
          .map((emailAsKey: any) => {
            const { id } = members[emailAsKey];
            if (!emailAsKey || !id) return null;

            if (roles.includes(members?.[emailAsKey]?.permission)) {
              return members[emailAsKey];
            }
            return null;
          })
          .filter((member) => !!member)
      : Object.keys(members).map((emailAsKey) => members?.[emailAsKey]);

    const membersWithDetails = await Promise.all(
      membersWithRoles.map(async (member) => {
        const { email, id } = member;

        try {
          const memberResponse = await intergrationSdk.users.show({
            ...(id ? { id } : { email }),
          });
          const [memberUser] = denormalisedResponseEntities(memberResponse);
          return memberUser;
        } catch (error) {
          console.error(error);
          return null;
        }
      }),
    );

    const membersWithDetailsWithoutNull = membersWithDetails.filter(
      (member) => !!member,
    );

    res.json(membersWithDetailsWithoutNull);
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(handler);
