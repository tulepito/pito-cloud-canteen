import { randomUUID } from 'crypto';
import difference from 'lodash/difference';
import differenceBy from 'lodash/differenceBy';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { EHttpStatusCode } from '@apis/errors';
import cookies from '@services/cookie';
import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import companyChecker from '@services/permissionChecker/company';
import { handleError } from '@services/sdk';
import { denormalisedResponseEntities, User } from '@utils/data';

const { UUID } = require('sharetribe-flex-sdk').types;

type TMemberApi = {
  id: string;
  email: string;
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { companyId, groupId, groupInfo, groupMembers } = req.body;
  const integrationSdk = getIntegrationSdk();
  const companyAccount = await fetchUser(companyId);
  const apiMethod = req.method;

  switch (apiMethod) {
    case HttpMethod.POST:
      try {
        const { groups = [], members = {} } =
          User(companyAccount).getMetadata();
        const newGroupId = randomUUID();
        const newGroup = {
          id: newGroupId,
          ...groupInfo,
          members: [...groupMembers],
        };

        groupMembers.forEach(({ email }: TMemberApi) => {
          members[email] = {
            ...members[email],
            groups: Array.from(
              new Set(members[email]?.groups || []).add(newGroupId),
            ),
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
            { expand: true },
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
            const { groupList = [] } =
              memberData.attributes.profile.metadata || {};
            await integrationSdk.users.updateProfile({
              id,
              metadata: {
                groupList: Array.from(new Set(groupList).add(newGroupId)),
              },
            });
          }),
        );
        res.status(EHttpStatusCode.Ok).json(updatedCompanyAccount);
      } catch (error) {
        handleError(res, error);
      }
      break;
    case HttpMethod.PUT:
      {
        const { addedMembers = [], deletedMembers = [] } = req.body;
        const { groups = [], members = {} } =
          User(companyAccount).getMetadata();

        const currentGroupIndex = groups.findIndex(
          (_group: any) => _group.id === groupId,
        );
        const newGroupMembers = [
          ...differenceBy(
            groups[currentGroupIndex].members,
            deletedMembers,
            'id',
          ),
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
            { expand: true },
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
            const { groupList = [] } =
              memberData.attributes.profile.metadata || {};
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
            const { groupList = [] } =
              memberData.attributes.profile.metadata || {};
            await integrationSdk.users.updateProfile({
              id,
              metadata: {
                groupList: difference(groupList, [groupId]),
              },
            });
          }),
        );

        res.status(EHttpStatusCode.Ok).json(updatedCompanyAccount);
      }
      break;
    case HttpMethod.DELETE:
      try {
        const { groups = [], members = {} } =
          User(companyAccount).getMetadata();

        const onDeletingGroup = groups.find(
          (_group: any) => _group.id === groupId,
        );

        onDeletingGroup.members.forEach(({ email }: TMemberApi) => {
          members[email] = {
            ...members[email],
            groups: members[email].groups.filter(
              (_group: string) => _group !== groupId,
            ),
          };
        });

        const updatedGroups = groups.filter(
          (_group: any) => _group.id !== groupId,
        );

        const updatedCompanyAccountResponse =
          await integrationSdk.users.updateProfile(
            {
              id: new UUID(companyId),
              metadata: {
                members,
                groups: updatedGroups,
              },
            },
            { expand: true },
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
            const { groupList = [] } =
              memberData.attributes.profile.metadata || {};
            await integrationSdk.users.updateProfile({
              id,
              metadata: {
                groupList: difference(groupList, [groupId]),
              },
            });
          }),
        );
        res.status(EHttpStatusCode.Ok).json(updatedCompanyAccount);
      } catch (error) {
        handleError(res, error);
      }
      break;
    default:
      break;
  }
}

export default cookies(companyChecker(handler));
