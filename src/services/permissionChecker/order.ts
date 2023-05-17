import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { EHttpStatusCode } from '@apis/errors';
import { fetchListing } from '@services/integrationHelper';
import { getSdk, handleError } from '@services/sdk';
import { CompanyPermission } from '@src/types/UserPermission';
import { denormalisedResponseEntities, Listing, User } from '@utils/data';

const orderChecker =
  (handler: NextApiHandler) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const sdk = getSdk(req, res);
      const currentUserResponse = await sdk.currentUser.show();
      const { companyId, orderId } = req.body;
      const apiMethod = req.method;
      const [currentUser] = denormalisedResponseEntities(currentUserResponse);
      const { isAdmin = false, company = {} } = User(currentUser).getMetadata();

      switch (apiMethod) {
        case HttpMethod.POST: {
          if (!companyId) {
            return res.status(EHttpStatusCode.Forbidden).json({
              message: 'Missing required key',
            });
          }
          const userPermission = company[companyId]?.permission;

          if (
            userPermission &&
            CompanyPermission.includes(userPermission) &&
            !isAdmin
          ) {
            return res.status(EHttpStatusCode.Forbidden).json({
              message: "You don't have permission to access this api!",
            });
          }
          break;
        }
        case HttpMethod.PUT: {
          if (!orderId) {
            return res.status(EHttpStatusCode.Forbidden).json({
              message: 'Missing required key',
            });
          }

          const orderListing = await fetchListing(orderId);
          const { clientId } = Listing(orderListing).getMetadata();
          const userPermission = company[clientId]?.permission;
          if (
            userPermission &&
            !CompanyPermission.includes(userPermission) &&
            !isAdmin
          ) {
            return res.status(EHttpStatusCode.Forbidden).json({
              message: "You don't have permission to access this api!",
            });
          }
          break;
        }
        default:
          break;
      }

      return handler(req, res);
    } catch (error) {
      handleError(res, error);
    }
  };

export default orderChecker;
