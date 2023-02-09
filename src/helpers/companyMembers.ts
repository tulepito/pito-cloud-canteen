import { User } from '@utils/data';
import type { TObject, TUser } from '@utils/types';
import filter from 'lodash/filter';
import flatten from 'lodash/flatten';
import uniq from 'lodash/uniq';

export const getAllCompanyMembers = (companyAccount: TUser) => {
  const { members = {} } = User(companyAccount).getMetadata();

  return Object.values<TObject>(members).map<string>(({ id }: TObject) => id);
};

export const calculateGroupMembers = (
  companyAccount: TUser,
  groupList: string[],
) => {
  const { groups } = User(companyAccount).getMetadata();

  if (groupList.includes('allMembers')) {
    return getAllCompanyMembers(companyAccount);
  }

  const allGroupMembers = groupList.map<string>((groupId: string) => {
    const currentGroup = groups.find((_group: any) => _group.id === groupId);
    return currentGroup?.members.map((member: any) => member.id);
  });

  return uniq(flatten(allGroupMembers)) as string[];
};

export const calculateGroupMembersAmount = (
  companyAccount: TUser,
  groupList: string[] = [],
) => {
  return calculateGroupMembers(companyAccount, groupList).length;
};

export const getGroupNames = (groupIds: string[], groupList: any) => {
  return filter(groupList, (group: any) => (groupIds || []).includes(group.id))
    .map((group: any) => group.name)
    .join(', ');
};

export const checkMemberBelongToCompany = (
  memberEmail: string,
  companyAccount: TUser,
) => {
  const { members = {} } = User(companyAccount).getMetadata();
  return !!members[memberEmail];
};

export const getMemberById = (id: string, companyMembers: TUser[]) => {
  return companyMembers.find((_member) => User(_member).getId() === id);
};
