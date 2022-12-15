import { UserPermission } from '@src/types/UserPermission';
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

import { denormalisedResponseEntities } from './data';
import { getSdk } from './sdk';

const permissionChecker =
  (handler: NextApiHandler) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    const { companyId } = req.body;
    const sdk = getSdk(req, res);
    const currentUserResponse = await sdk.currentUser.show();
    const [currentUser] = denormalisedResponseEntities(currentUserResponse);
    if (!companyId) {
      return res.status(403).json({
        message: 'Missing required key',
      });
    }
    const { company = {}, isPITOAdmin = false } =
      currentUser.attributes.profile.metadata;
    const userPermission = company[companyId].permission;

    if (
      !userPermission ||
      userPermission !== UserPermission.BOOKER ||
      !isPITOAdmin
    ) {
      return res.status(403).json({
        message: "You don't have permission to access this api!",
      });
    }
    return handler(req, res);
  };

export default permissionChecker;
