import { getSdk, handleError } from '@services/sdk';
import { denormalisedResponseEntities } from '@utils/data';
import { checkUserIsAdmin } from '@utils/permissions';
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

const adminChecker =
  (handler: NextApiHandler) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const sdk = getSdk(req, res);

      const currentUserResponse = await sdk.currentUser.show();
      const [currentUser] = denormalisedResponseEntities(currentUserResponse);

      const isAdmin = checkUserIsAdmin(currentUser);

      if (!isAdmin) {
        return res.status(403).json({
          message: 'Forbidden',
        });
      }
      return handler(req, res);
    } catch (error) {
      console.log('error', error);
      handleError(res, error);
    }
  };

export default adminChecker;
