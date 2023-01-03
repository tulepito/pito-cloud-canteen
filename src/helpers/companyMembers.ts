import type { TUser } from '@utils/types';
import flatten from 'lodash/flatten';
import uniq from 'lodash/uniq';

export const calculateGroupMembersAmount = (
  companyAccount: TUser,
  groupList: string[],
) => {
  const { groups, members = {} } = companyAccount.attributes.profile.metadata;
  if (groupList.includes('allMembers')) {
    return Object.keys(members).length;
  }

  const allGroupMembers = groupList.map((groupId: string) => {
    const currentGroup = groups.find((_group: any) => _group.id === groupId);
    return currentGroup.members.map((member: any) => member.id);
  });

  return uniq(flatten(allGroupMembers)).length;
};
