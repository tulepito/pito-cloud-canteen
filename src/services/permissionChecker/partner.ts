import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

import { getSdk, handleError } from '@services/sdk';
import { CurrentUser, denormalisedResponseEntities } from '@src/utils/data';

const partnerChecker =
  (handler: NextApiHandler) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const sdk = getSdk(req, res);
      const [currentUser] = denormalisedResponseEntities(
        await sdk.currentUser.show(),
      );
      if (!currentUser) {
        return res.status(401).json({
          message: 'Unauthenticated!',
        });
      }

      const currentUserGetter = CurrentUser(currentUser);
      const { isPartner } = currentUserGetter.getMetadata();
      if (!isPartner) {
        return res.status(401).json({
          message: "You don't have permission to access this api!",
        });
      }

      return handler(req, res);
    } catch (error) {
      handleError(res, error);
    }
  };

export default partnerChecker;
