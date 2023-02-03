import { UserPermission } from '@src/types/UserPermission';
import { USER } from '@utils/data';
import type { TCurrentUser, TObject, TUser } from '@utils/types';
import filter from 'lodash/filter';
import flatten from 'lodash/flatten';
import uniq from 'lodash/uniq';

export const getCompanyIdFromBookerUser = (user: TUser | TCurrentUser) => {
  const companies = user?.attributes?.profile?.metadata?.company || {};
  const companyIds = Object.entries(companies).find((entry) => {
    const [, permissionData] = entry;

    return (permissionData as TObject).permission === UserPermission.BOOKER;
  });

  return companyIds ? companyIds[0] : '';
};

export const calculateGroupMembers = (
  companyAccount: TUser,
  groupList: string[],
) => {
  const { groups, members = {} } =
    companyAccount.attributes.profile.metadata || {};

  if (groupList.includes('allMembers')) {
    return Object.values(members).map((_member: any) => _member.id);
  }

  const allGroupMembers = groupList.map((groupId: string) => {
    const currentGroup = groups.find((_group: any) => _group.id === groupId);
    return currentGroup.members.map((member: any) => member.id);
  });

  return uniq(flatten(allGroupMembers));
};

export const calculateGroupMembersAmount = (
  companyAccount: TUser,
  groupList: string[],
) => {
  return calculateGroupMembers(companyAccount, groupList).length;
};

export const getGroupNames = (groupIds: string[], groupList: any) => {
  return filter(groupList, (group: any) => groupIds.includes(group.id))
    .map((group: any) => group.name)
    .join(', ');
};

export const checkMemberBelongToCompany = (
  memberEmail: string,
  companyAccount: TUser,
) => {
  const { members = {} } = USER(companyAccount).getMetadata();
  return !!members[memberEmail];
};
