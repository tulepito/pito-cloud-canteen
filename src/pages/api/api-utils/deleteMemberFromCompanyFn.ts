import { compact, difference } from 'lodash';

import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { denormalisedResponseEntities, User } from '@utils/data';
import type { TCompanyGroup } from '@utils/types';

export const deleteMemberFromCompanyFn = async ({
  memberEmail,
  companyId,
}: {
  memberEmail: string;
  companyId: string;
}) => {
  const integrationSdk = getIntegrationSdk();

  const companyAccount = await fetchUser(companyId);
  const { members = {}, groups = [] } = User(companyAccount).getMetadata();

  // Step delete email in members
  delete members[memberEmail];

  // Step remove email in all groups of company
  const newGroups = groups.map((group: TCompanyGroup) => {
    const newGroupMembers = group.members.filter(
      (member) => member.email !== memberEmail,
    );
    return {
      ...group,
      members: newGroupMembers,
    };
  });

  // Step get group list that member joined
  const groupListMemberJoined = compact(
    groups.map((group: TCompanyGroup) => {
      const newGroupMembers = group.members.filter(
        (member) => member.email === memberEmail,
      );
      return newGroupMembers.length > 0 && group.id;
    }),
  );

  // Check member has account on Flex or not
  try {
    const memberAccountResponse = await integrationSdk.users.show({
      email: memberEmail,
    });
    const [memberAccount] = denormalisedResponseEntities(memberAccountResponse);
    // CASE email has account on Flex: update member metadata
    const {
      company = {},
      companyList = [],
      groupList,
    } = User(memberAccount).getMetadata();
    const newGroupList = difference(groupList, groupListMemberJoined);
    delete company[companyId];
    const newCompanyList = difference(companyList, [companyId]);
    await integrationSdk.users.updateProfile({
      id: User(memberAccount).getId(),
      metadata: {
        company,
        companyList: newCompanyList,
        groupList: newGroupList,
      },
    });
  } catch (error: any) {
    // CASE email has no account on Flex yet: throw error
    const { errors } = error.data;
    if (errors[0].status !== 404) {
      throw error;
    }
  }
  const updatedCompanyAccountResponse =
    await integrationSdk.users.updateProfile(
      {
        id: companyId,
        metadata: {
          members,
          groups: newGroups,
        },
      },
      {
        include: ['profileImage'],
        expand: true,
      },
    );
  const [updatedCompanyAccount] = denormalisedResponseEntities(
    updatedCompanyAccountResponse,
  );
  return updatedCompanyAccount;
};
