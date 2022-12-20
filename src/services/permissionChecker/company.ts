import { denormalisedResponseEntities } from '@services/data';
import { getSdk, handleError } from '@services/sdk';
import { UserPermission } from '@src/types/UserPermission';
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

const needCheckingRequestBodyMethod = ['POST', 'PUT', 'DELETE'];

const companyChecker =
  (handler: NextApiHandler) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const apiMethod = req.method as string;
      const { companyId } = req.body;
      const sdk = getSdk(req, res);
      const currentUserResponse = await sdk.currentUser.show();
      const [currentUser] = denormalisedResponseEntities(currentUserResponse);
      if (!companyId && needCheckingRequestBodyMethod.includes(apiMethod)) {
        return res.status(403).json({
          message: 'Missing required key',
        });
      }
      const { company = {}, isPITOAdmin = true } =
        currentUser.attributes.profile.metadata;
      const userPermission = company[companyId]?.permission;
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
    } catch (error) {
      handleError(res, error);
    }
  };

export default companyChecker;
