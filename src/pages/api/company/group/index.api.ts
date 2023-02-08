import { HTTP_METHODS } from '@pages/api/helpers/constants';
import cookies from '@services/cookie';
import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import companyChecker from '@services/permissionChecker/company';
import { handleError } from '@services/sdk';
import { denormalisedResponseEntities, USER } from '@utils/data';
import { randomUUID } from 'crypto';
import difference from 'lodash/difference';
import differenceBy from 'lodash/differenceBy';
import type { NextApiRequest, NextApiResponse } from 'next';

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
    case HTTP_METHODS.POST:
      try {
        const { groups = [], members = {} } =
          USER(companyAccount).getMetadata();
        const newGroupId = randomUUID();
        const newGroup = {
          id: newGroupId,
          ...groupInfo,
          members: [...groupMembers],
        };

        groupMembers.forEach(({ email }: TMemberApi) => {
          members[email] = {
            ...members[email],
            groups: members[email].groups.concat(newGroupId),
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
                groupList: groupList.concat(newGroupId),
              },
            });
          }),
        );
        res.status(200).json(updatedCompanyAccount);
      } catch (error) {
        handleError(res, error);
      }
      break;
    case HTTP_METHODS.PUT:
      {
        const { addedMembers = [], deletedMembers = [] } = req.body;
        const { groups = [], members = {} } =
          USER(companyAccount).getMetadata();

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
        if (addedMembers.length > 0) {
          addedMembers.forEach(({ email }: TMemberApi) => {
            members[email].groups = members[email].groups.concat(groupId);
          });
        }

        if (deletedMembers.length > 0) {
          deletedMembers.forEach(({ email }: TMemberApi) => {
            members[email].groups = members[email].groups.filter(
              (_groupId: string) => _groupId !== groupId,
            );
          });
        }

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
                groupList: groupList.concat(groupId),
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

        res.status(200).json(updatedCompanyAccount);
      }
      break;
    case HTTP_METHODS.DELETE:
      try {
        const { groups = [], members = {} } =
          USER(companyAccount).getMetadata();

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
        res.status(200).json(updatedCompanyAccount);
      } catch (error) {
        handleError(res, error);
      }
      break;
    default:
      break;
  }
}

export default cookies(companyChecker(handler));
