import filter from 'lodash/filter';
import flatten from 'lodash/flatten';
import isEmpty from 'lodash/isEmpty';
import uniq from 'lodash/uniq';

import { ECompanyPermission } from '@src/utils/enums';
import { User } from '@utils/data';
import type { TCurrentUser, TObject, TUser } from '@utils/types';

export const getAllCompanyMembers = (companyAccount: TUser) => {
  const { members = {} } = User(companyAccount).getMetadata();

  return Object.values<TObject>(members).reduce<string[]>(
    (previous, { id }) => {
      return isEmpty(id) ? previous : previous.concat([id]);
    },
    [],
  );
};

export const getCompanyIdFromBookerUser = (user: TUser | TCurrentUser) => {
  const companies = user?.attributes?.profile?.metadata?.company || {};
  const companyIds = Object.entries(companies).find((entry) => {
    const [, permissionData] = entry;

    return [ECompanyPermission.booker, ECompanyPermission.owner].includes(
      (permissionData as TObject).permission,
    );
  });

  return companyIds ? companyIds[0] : '';
};

export const calculateGroupMembers = (
  companyAccount: TUser,
  groupList: string[],
) => {
  const { groups = [] } = User(companyAccount).getMetadata();

  if (isEmpty(groupList) || groupList.includes('allMembers')) {
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

export const getGroupListNames = (member: any, groupList: any) => {
  const id = member?.id?.uuid;
  const email = member?.attributes?.email;
  const memberGroupIds = groupList.reduce(
    (groupIds: string[], curr: TObject) => {
      const { members = [], id: groupId } = curr || {};

      if (
        typeof members.find(
          ({ id: memberIdFromGroup, email: memberEmailFromGroup }: TObject) => {
            return memberIdFromGroup === id || memberEmailFromGroup === email;
          },
        ) !== 'undefined'
      ) {
        return [...groupIds, groupId];
      }

      return groupIds;
    },
    [],
  );

  return getGroupNames(memberGroupIds, groupList);
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
