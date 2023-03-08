import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/integrationSdk';
import type { TObject } from '@src/utils/types';

const queryUserByEmail = async (emails: string[], queryParams: TObject) => {
  const emailsAsArray = Array.isArray(emails) ? emails : [emails];
  const intergrationSdk = getIntegrationSdk();

  const users = await Promise.all(
    emailsAsArray.map(async (email: string) => {
      const response = await intergrationSdk.users.show({ email }, queryParams);
      const [user] = denormalisedResponseEntities(response);
      return user;
    }),
  );

  return users;
};

export default queryUserByEmail;
