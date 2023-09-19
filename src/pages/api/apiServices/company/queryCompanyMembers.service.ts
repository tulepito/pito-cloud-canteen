import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/sdk';
import { User } from '@src/utils/data';
import { EImageVariants } from '@src/utils/enums';
import type { TUser } from '@src/utils/types';

const queryCompanyMembers = async (companyId: string) => {
  const integrationSdk = getIntegrationSdk();
  const response = await integrationSdk.users.show({
    id: companyId,
  });

  const [company] = denormalisedResponseEntities(response);
  const { members = {} } = User(company).getMetadata();

  const existedUserQueryResponse = await integrationSdk.users.query({
    meta_companyList: companyId,
    include: 'profileImage',
    'fields.image': [
      `variants.${EImageVariants.squareSmall}`,
      `variants.${EImageVariants.squareSmall2x}`,
      `variants.${EImageVariants.scaledLarge}`,
    ],
  });

  const nonExistedUsers = Object.keys(members)
    .filter((key: string) => !members[key].id)
    .map((key: string) => members[key]);

  const existedUsers = denormalisedResponseEntities(existedUserQueryResponse);
  const membersWithDetails = existedUsers.map((user: TUser) => {
    const key = Object.keys(members).find(
      (email) => email === user.attributes.email,
    );

    return { ...user, ...(key ? { ...members[key] } : {}) };
  });

  const mergedUsers = [...membersWithDetails, ...nonExistedUsers];

  return mergedUsers;
};

export default queryCompanyMembers;
