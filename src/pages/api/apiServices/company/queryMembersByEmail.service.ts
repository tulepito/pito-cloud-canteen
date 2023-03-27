import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/integrationSdk';
import { User } from '@src/utils/data';
import { EImageVariants } from '@src/utils/enums';
import type { TCompanyMemberWithDetails, TObject } from '@src/utils/types';

import queryCompanyMembers from './queryCompanyMembers.service';

const queryMembersByEmail = async ({
  emails,
  queryParams,
  companyId,
}: {
  emails: string[];
  queryParams: TObject;
  companyId: string;
}) => {
  const emailsAsArray = Array.isArray(emails) ? emails : [emails];
  const intergrationSdk = getIntegrationSdk();
  const noExistedUsers: string[] = [];

  const companyMembers = await queryCompanyMembers(companyId);

  const users = await Promise.all(
    emailsAsArray.map(async (email: string) => {
      try {
        const response = await intergrationSdk.users.show(
          {
            email,
            include: 'profileImage',
            'fields.image': [
              `variants.${EImageVariants.squareSmall}`,
              `variants.${EImageVariants.squareSmall2x}`,
              `variants.${EImageVariants.scaledLarge}`,
            ],
          },
          queryParams,
        );
        const [user] = denormalisedResponseEntities(response);
        const memberIsAdmin = User(user).getMetadata().isAdmin;
        const memberIsPartner = User(user).getMetadata().isPartner;
        const emailIsExisted = companyMembers.some(
          (member: TCompanyMemberWithDetails) => member?.email === email,
        );

        if (emailIsExisted) {
          return null;
        }

        if (memberIsAdmin || memberIsPartner) {
          return null;
        }

        return user;
      } catch (error) {
        const emailIsExisted = companyMembers.some(
          (member: TCompanyMemberWithDetails) => member?.email === email,
        );

        if (emailIsExisted) {
          return null;
        }

        noExistedUsers.push(email);

        return null;
      }
    }),
  );

  const userNotNull = users.filter((user) => user !== null);

  return { users: userNotNull, noExistedUsers };
};

export default queryMembersByEmail;
