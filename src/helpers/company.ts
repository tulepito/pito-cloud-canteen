import filter from 'lodash/filter';
import flatten from 'lodash/flatten';
import isEmpty from 'lodash/isEmpty';
import uniq from 'lodash/uniq';

import { getIntegrationSdk } from '@services/sdk';
import { ECompanyPermission } from '@src/utils/enums';
import { denormalisedResponseEntities, User } from '@utils/data';
import type { TCurrentUser, TObject, TUser } from '@utils/types';

export const ensureActiveUserIds = async (
  userIds: string[],
  batchSize = 100,
): Promise<string[]> => {
  const integrationSdk = getIntegrationSdk();

  const chunkArray = <T>(arr: T[], size: number): T[][] =>
    Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size),
    );

  const chunks = chunkArray(userIds, batchSize);

  const results: string[][] = await Promise.all(
    chunks.map(async (chunk) => {
      const response = await integrationSdk.users.query({
        meta_id: chunk,
      });

      return denormalisedResponseEntities(response).map(
        (participant: {
          id: {
            uuid: string;
          };
        }) => participant.id.uuid,
      );
    }),
  );

  // Flatten results
  return results.flat();
};

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

  const allGroupMemberIds = groupList.map<string>((groupId: string) => {
    const currentGroup = groups.find((_group: any) => _group.id === groupId);

    return currentGroup?.members.map((member: any) => member.id);
  });

  return uniq(flatten(allGroupMemberIds)) as string[];
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
