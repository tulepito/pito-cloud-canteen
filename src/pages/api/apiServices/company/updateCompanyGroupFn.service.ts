import { difference, differenceBy } from 'lodash';

import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { denormalisedResponseEntities, User } from '@utils/data';
import type { TObject } from '@utils/types';

const { UUID } = require('sharetribe-flex-sdk').types;

type TCreateCompanyGroupFn = {
  companyId: string;
  groupId: string;
  groupInfo: TObject;
  deletedMembers: any;
  addedMembers: any;
};

type TMemberApi = {
  id: string;
  email: string;
};

const updateCompanyGroupFn = async ({
  companyId,
  groupInfo,
  groupId,
  deletedMembers,
  addedMembers,
}: TCreateCompanyGroupFn) => {
  const integrationSdk = getIntegrationSdk();
  const companyAccount = await fetchUser(companyId);

  const { groups = [], members = {} } = User(companyAccount).getMetadata();

  const currentGroupIndex = groups.findIndex(
    (_group: any) => _group.id === groupId,
  );

  const newGroupMembers = [
    ...differenceBy(groups[currentGroupIndex].members, deletedMembers, 'id'),
    ...addedMembers,
  ];
  groups[currentGroupIndex] = {
    ...groups[currentGroupIndex],
    ...(groupInfo || {}),
    members: newGroupMembers,
  };

  addedMembers.forEach(({ email }: TMemberApi) => {
    members[email].groups = Array.from(
      new Set(members[email].groups).add(groupId),
    );
  });

  deletedMembers.forEach(({ email }: TMemberApi) => {
    members[email].groups = members[email].groups.filter(
      (_groupId: string) => _groupId !== groupId,
    );
  });

  const updatedCompanyAccountResponse =
    await integrationSdk.users.updateProfile(
      {
        id: new UUID(companyId),
        metadata: {
          members,
          groups: [...groups],
        },
      },
      { include: 'profileImage', expand: true },
    );
  const [updatedCompanyAccount] = denormalisedResponseEntities(
    updatedCompanyAccountResponse,
  );

  await Promise.all(
    addedMembers.map(async ({ id }: TMemberApi) => {
      const memberResponse = await integrationSdk.users.show({
        id,
      });
      const [memberData] = denormalisedResponseEntities(memberResponse);
      const { groupList = [] } = memberData.attributes.profile.metadata || {};
      await integrationSdk.users.updateProfile({
        id,
        metadata: {
          groupList: Array.from(new Set(groupList).add(groupId)),
        },
      });
    }),
  );

  await Promise.all(
    deletedMembers.map(async ({ id }: TMemberApi) => {
      const memberResponse = await integrationSdk.users.show({
        id,
      });
      const [memberData] = denormalisedResponseEntities(memberResponse);
      const { groupList = [] } = memberData.attributes.profile.metadata || {};
      await integrationSdk.users.updateProfile({
        id,
        metadata: {
          groupList: difference(groupList, [groupId]),
        },
      });
    }),
  );

  return updatedCompanyAccount;
};

export default updateCompanyGroupFn;
