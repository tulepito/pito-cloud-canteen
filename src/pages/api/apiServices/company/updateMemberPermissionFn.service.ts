import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import type { UserPermission } from '@src/types/UserPermission';
import { denormalisedResponseEntities, User } from '@utils/data';
import type { TCompany, TObject } from '@utils/types';

import isBookerInOrderProgress from './isBookerInOrderProgress.service';

const updateMemberPermissionFn = async ({
  companyId,
  memberEmail,
  permission,
}: {
  companyId: string;
  memberEmail: string;
  permission: UserPermission;
}) => {
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
  const [newCompany] = denormalisedResponseEntities(response);

  return newCompany;
};

export default updateMemberPermissionFn;
