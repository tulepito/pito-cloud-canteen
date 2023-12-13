import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

import { EHttpStatusCode } from '@apis/errors';
import { getSdk, handleError } from '@services/sdk';
import { CompanyPermissions } from '@src/types/UserPermission';
import { denormalisedResponseEntities } from '@utils/data';

const needCheckingRequestBodyMethod = ['POST', 'PUT', 'DELETE'];

const companyChecker =
  (handler: NextApiHandler) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const apiMethod = req.method as string;
      const { companyId: companyIdFromQuery } = req.query;
      const { companyId: companyIdFromBody } = req.body;

      const sdk = getSdk(req, res);
      const currentUserResponse = await sdk.currentUser.show();
      const [currentUser] = denormalisedResponseEntities(currentUserResponse);

      const { company = {}, companyList = [] } =
        currentUser.attributes.profile.metadata;
      const companyId =
        companyIdFromQuery || companyIdFromBody || companyList[0];
      const userPermission = company[companyId]?.permission;

      if (!companyId && needCheckingRequestBodyMethod.includes(apiMethod)) {
        return res.status(EHttpStatusCode.Forbidden).json({
          message: 'Missing required key',
        });
      }

      if (
        !userPermission ||
        (userPermission && !CompanyPermissions.includes(userPermission))
      ) {
        return res.status(EHttpStatusCode.Forbidden).json({
          message: "You don't have permission to access this api!",
        });
      }

      req.previewData = {
        currentUser,
      };

      return handler(req, res);
    } catch (error) {
      handleError(res, error);
    }
  };

export default companyChecker;
