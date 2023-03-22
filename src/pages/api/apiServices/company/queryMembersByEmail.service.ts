import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/integrationSdk';
import { User } from '@src/utils/data';
import type { TObject } from '@src/utils/types';

const queryMembersByEmail = async (emails: string[], queryParams: TObject) => {
  const emailsAsArray = Array.isArray(emails) ? emails : [emails];
  const intergrationSdk = getIntegrationSdk();
  const noExistedUsers: string[] = [];
  const users = await Promise.all(
    emailsAsArray.map(async (email: string) => {
      try {
        const response = await intergrationSdk.users.show(
          { email },
          queryParams,
        );
        const [user] = denormalisedResponseEntities(response);
        const memberIsAdmin = User(user).getMetadata().isAdmin;
        const memberIsPartner = User(user).getMetadata().isPartner;

        if (memberIsAdmin || memberIsPartner) return null;

        return user;
      } catch (error) {
        noExistedUsers.push(email);

        return null;
      }
    }),
  );

  const userNotNull = users.filter((user) => user !== null);

  return { users: userNotNull, noExistedUsers };
};

export default queryMembersByEmail;
