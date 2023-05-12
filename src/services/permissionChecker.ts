import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

import { EHttpStatusCode } from '@apis/errors';
import { CompanyPermission } from '@src/types/UserPermission';

import { denormalisedResponseEntities } from './data';
import { getSdk } from './sdk';

const needCheckingRequestBodyMethod = ['POST', 'PUT'];

const permissionChecker =
  (handler: NextApiHandler) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    const apiMethod = req.method as string;
    const { companyId } = req.body;
    const sdk = getSdk(req, res);
    const currentUserResponse = await sdk.currentUser.show();
    const [currentUser] = denormalisedResponseEntities(currentUserResponse);

    if (!companyId && needCheckingRequestBodyMethod.includes(apiMethod)) {
      return res.status(EHttpStatusCode.Forbidden).json({
        message: 'Missing required key',
      });
    }
    const { company = {}, isPITOAdmin = false } =
      currentUser.attributes.profile.metadata;
    const userPermission = company[companyId]?.permission;

    if (
      !userPermission ||
      !CompanyPermission.includes(userPermission) ||
      !isPITOAdmin
    ) {
      return res.status(EHttpStatusCode.Forbidden).json({
        message: "You don't have permission to access this api!",
      });
    }

    return handler(req, res);
  };

export default permissionChecker;
