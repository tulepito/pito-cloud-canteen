import { difference } from 'lodash';

import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { denormalisedResponseEntities, User } from '@utils/data';

const { UUID } = require('sharetribe-flex-sdk').types;

type TDeleteCompanyGroupFn = {
  companyId: string;
  groupId: string;
};

type TMemberApi = {
  id: string;
  email: string;
};

const deleteCompanyGroupFn = async ({
  companyId,
  groupId,
}: TDeleteCompanyGroupFn) => {
  const integrationSdk = getIntegrationSdk();
  const companyAccount = await fetchUser(companyId);
  const { groups = [], members = {} } = User(companyAccount).getMetadata();

  const onDeletingGroup = groups.find((_group: any) => _group.id === groupId);

  onDeletingGroup.members.forEach(({ email }: TMemberApi) => {
    members[email] = {
      ...members[email],
      groups: members[email].groups.filter(
        (_group: string) => _group !== groupId,
      ),
    };
  });

  const updatedGroups = groups.filter((_group: any) => _group.id !== groupId);

  const updatedCompanyAccountResponse =
    await integrationSdk.users.updateProfile(
      {
        id: new UUID(companyId),
        metadata: {
          members,
          groups: updatedGroups,
        },
      },
      { include: 'profileImage', expand: true },
    );
  const [updatedCompanyAccount] = denormalisedResponseEntities(
    updatedCompanyAccountResponse,
  );

  await Promise.all(
    onDeletingGroup.members.map(async ({ id }: TMemberApi) => {
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

export default deleteCompanyGroupFn;
