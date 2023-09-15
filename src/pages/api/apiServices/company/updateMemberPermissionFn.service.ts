import { CustomError } from '@apis/errors';
import { fetchUser, fetchUserByEmail } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { UserPermission } from '@src/types/UserPermission';
import { denormalisedResponseEntities, User } from '@utils/data';
import type { TCompany, TObject } from '@utils/types';

import isBookerInOrderProgress from './isBookerInOrderProgress.service';

const customFetchUserByEmail = async (email: string) => {
  try {
    const user = await fetchUserByEmail(email);

    return user;
  } catch (_) {
    return null;
  }
};

const updateMemberCompanyData = async ({
  email,
  permission,
  companyId,
}: {
  email: string;
  permission: UserPermission;
  companyId: string;
}) => {
  try {
    const intergrationSdk = getIntegrationSdk();
    const memberAccount = await customFetchUserByEmail(email);

    if (!memberAccount) {
      console.error(
        '[updateMemberCompanyData] error: ',
        'memberAccount not found with email: '.concat(email),
      );
    }

    const { company: memberCompany = {} } = User(memberAccount).getMetadata();

    if (!memberCompany[companyId]) {
      memberCompany[companyId] = {};
    }

    const newCompanyObj = Object.keys(memberCompany).reduce(
      (prev: TObject, key: string) => {
        if (key === companyId) {
          return {
            ...prev,
            [key]: {
              ...memberCompany[key],
              permission,
            },
          };
        }

        return {
          ...prev,
          [key]: memberCompany[key],
        };
      },
      {},
    );

    await intergrationSdk.users.updateProfile({
      id: User(memberAccount).getId(),
      metadata: {
        company: newCompanyObj,
      },
    });
  } catch (error) {
    console.error('[updateMemberCompanyData] error: ', {
      companyId,
      memberEmail: email,
      permission,
      error,
    });
  }
};

const updateMemberPermissionFn = async ({
  companyId,
  memberEmail,
  permission,
}: {
  companyId: string;
  memberEmail: string;
  permission: UserPermission;
}) => {
  if (permission === UserPermission.OWNER) {
    throw new CustomError('Forbidden', 403, {
      errors: [
        {
          id: new Date().getTime(),
          status: 403,
          code: 'change-owner-permission',
          title: 'Forbidden',
        },
      ],
    });
  }
  const company = await fetchUser(companyId);

  const intergrationSdk = getIntegrationSdk();

  const { members = {} } = User(company as unknown as TCompany).getMetadata();

  await isBookerInOrderProgress({
    members,
    memberEmail,
  });

  const newMembers = Object.keys(members).reduce(
    (prev: TObject, emailAsKey: string) => {
      if (emailAsKey === memberEmail) {
        return {
          ...prev,
          [emailAsKey]: {
            ...members[emailAsKey],
            permission,
          },
        };
      }

      return {
        ...prev,
        [emailAsKey]: members[emailAsKey],
      };
    },
    {},
  );

  const response = await intergrationSdk.users.updateProfile(
    {
      id: companyId,
      metadata: { members: newMembers },
    },
    {
      include: ['profileImage'],
      expand: true,
    },
  );

  updateMemberCompanyData({
    email: memberEmail,
    permission,
    companyId,
  });

  const [newCompany] = denormalisedResponseEntities(response);

  return newCompany;
};

export default updateMemberPermissionFn;
