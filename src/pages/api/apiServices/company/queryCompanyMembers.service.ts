import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/sdk';
import { User } from '@src/utils/data';
import type { TUser } from '@src/utils/types';

const queryCompanyMembers = async (companyId: string) => {
  const intergrationSdk = getIntegrationSdk();
  const response = await intergrationSdk.users.show(
    {
      id: companyId,
    },
    { expand: true },
  );

  const [company] = denormalisedResponseEntities(response);

  const { members = {} } = User(company).getMetadata();

  const existedUserQueryResponse = await intergrationSdk.users.query({
    meta_companyList: companyId,
  });

  const nonExistedUsers = Object.keys(members)
    .filter((key: string) => !members[key].id)
    .map((key: string) => members[key]);

  const existedusers = denormalisedResponseEntities(existedUserQueryResponse);
  const membersWithDetails = existedusers.map((user: TUser) => {
    const key = Object.keys(members).find(
      (email) => email === user.attributes.email,
    );
    return { ...user, ...(key ? { ...members[key] } : {}) };
  });

  const mergedUsers = [...membersWithDetails, ...nonExistedUsers];
  return mergedUsers;
};

export default queryCompanyMembers;
