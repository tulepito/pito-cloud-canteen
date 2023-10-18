import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

import { fetchUser } from '@services/integrationHelper';
import { handleError } from '@services/sdk';
import { User } from '@src/utils/data';
import { hashStr } from '@src/utils/hashes';

const { PITO_ADMIN_ID, EXTERNAL_API_KEY_SALT } = process.env;

const externalOnWheelChecker =
  (handler: NextApiHandler) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const admin = await fetchUser(PITO_ADMIN_ID!);
      const adminUser = User(admin);
      const { externalHashedApiKey } = adminUser.getMetadata();
      const { apikey } = req.headers;
      const hashedApiKeyFromHeader = hashStr(
        apikey as string,
        EXTERNAL_API_KEY_SALT,
      );
      if (externalHashedApiKey !== hashedApiKeyFromHeader) {
        throw new Error('Invalid API Key');
      }

      return handler(req, res);
    } catch (error) {
      handleError(res, error);
    }
  };

export default externalOnWheelChecker;
