import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/integrationSdk';
import { User } from '@src/utils/data';
import type { TObject } from '@src/utils/types';

const queryMembersByEmail = async (emails: string[], queryParams: TObject) => {
  const emailsAsArray = Array.isArray(emails) ? emails : [emails];
  const intergrationSdk = getIntegrationSdk();

  const users = await Promise.all(
    emailsAsArray.map(async (email: string) => {
      const response = await intergrationSdk.users.show({ email }, queryParams);
      const [user] = denormalisedResponseEntities(response);
      const memberIsAdmin = User(user).getMetadata().isAdmin;
      const memberIsPartner = User(user).getMetadata().isPartner;

      if (memberIsAdmin || memberIsPartner) return null;

      return user;
    }),
  );

  const userNotNull = users.filter((user) => user !== null);

  return userNotNull;
};

export default queryMembersByEmail;
