import { randomUUID } from 'crypto';

import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { denormalisedResponseEntities, User } from '@utils/data';
import type { TObject } from '@utils/types';

const { UUID } = require('sharetribe-flex-sdk').types;

type TCreateCompanyGroupFn = {
  companyId: string;
  groupInfo: TObject;
  groupMembers: any;
};

type TMemberApi = {
  id: string;
  email: string;
};

const createCompanyGroupFn = async ({
  companyId,
  groupInfo,
  groupMembers,
}: TCreateCompanyGroupFn) => {
  const integrationSdk = getIntegrationSdk();
  const companyAccount = await fetchUser(companyId);
  const { groups = [], members = {} } = User(companyAccount).getMetadata();
  const newGroupId = randomUUID();
  const newGroup = {
    id: newGroupId,
    ...groupInfo,
    members: [...groupMembers],
  };

  groupMembers.forEach(({ email }: TMemberApi) => {
    members[email] = {
      ...members[email],
      groups: Array.from(new Set(members[email].groups || []).add(newGroupId)),
    };
  });

  const updatedCompanyAccountResponse =
    await integrationSdk.users.updateProfile(
      {
        id: new UUID(companyId),
        metadata: {
          groups: [...groups, newGroup],
          members,
        },
      },
      { include: 'profileImage', expand: true },
    );

  const [updatedCompanyAccount] = denormalisedResponseEntities(
    updatedCompanyAccountResponse,
  );

  await Promise.all(
    groupMembers.map(async ({ id }: TMemberApi) => {
      const memberResponse = await integrationSdk.users.show({
        id,
      });
      const [memberData] = denormalisedResponseEntities(memberResponse);
      const { groupList = [] } = memberData.attributes.profile.metadata || {};
      await integrationSdk.users.updateProfile({
        id,
        metadata: {
          groupList: Array.from(new Set(groupList).add(newGroupId)),
        },
      });
    }),
  );

  return updatedCompanyAccount;
};

export default createCompanyGroupFn;
