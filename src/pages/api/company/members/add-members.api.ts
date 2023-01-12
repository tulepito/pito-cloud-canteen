import cookies from '@services/cookie';
import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import companyChecker from '@services/permissionChecker/company';
import { handleError } from '@services/sdk';
import { UserPermission } from '@src/types/UserPermission';
import { denormalisedResponseEntities, USER } from '@utils/data';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const integrationSdk = getIntegrationSdk();
  try {
    const { userIdList, noAccountEmailList, companyId } = req.body;
    // Step update data for existed user
    const newParticipantMembers = await Promise.all(
      userIdList.map(async (userId: string) => {
        const userAccount = await fetchUser(userId);
        const { company: userCompany = {}, companyList: userCompanyList = [] } =
          USER(userAccount).getMetadata();
        await integrationSdk.users.updateProfile({
          id: userId,
          metadata: {
            company: {
              ...userCompany,
              [companyId]: {
                permission: UserPermission.PARTICIPANT,
              },
            },
            companyList: [...userCompanyList, companyId],
          },
        });
        const { email: userEmail } = USER(userAccount).getAttributes();
        return {
          [userEmail]: {
            id: userId,
            email: userEmail,
            permission: UserPermission.PARTICIPANT,
            groups: [],
          },
        };
      }),
    );
    const newParticipantMembersObj = newParticipantMembers.reduce(
      (result, item) => {
        return {
          ...result,
          ...item,
        };
      },
      {},
    );

    // Step format no account email list to company member object
    const newNoAccountMembers = noAccountEmailList
      .map((email: string) => ({
        email,
        id: null,
        permission: UserPermission.PARTICIPANT,
        groups: [],
      }))
      .reduce((result: any, memberObj: any) => {
        return {
          ...result,
          [memberObj.email]: { ...memberObj },
        };
      }, {});

    // Step update company account metadata
    const companyAccount = await fetchUser(companyId);
    const { members = {} } = USER(companyAccount).getMetadata();
    const newCompanyMembers = {
      ...members,
      ...newNoAccountMembers,
      ...newParticipantMembersObj,
    };

    const updatedCompanyAccountResponse =
      await integrationSdk.users.updateProfile({
        id: companyId,
        metadata: {
          members: newCompanyMembers,
        },
      });

    const [updatedCompanyAccount] = denormalisedResponseEntities(
      updatedCompanyAccountResponse,
    );

    // Step handle send email for new participant members

    // Step handle send email for new no account members

    res.json(updatedCompanyAccount);
  } catch (error) {
    handleError(res, error);
  }
};

export default cookies(companyChecker(handler));
