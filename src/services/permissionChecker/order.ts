import { fetchListing } from '@services/integrationHelper';
import { getSdk, handleError } from '@services/sdk';
import { HTTP_METHODS } from '@src/pages/api/helpers/constants';
import { UserPermission } from '@src/types/UserPermission';
import { denormalisedResponseEntities, LISTING, USER } from '@utils/data';
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

const orderChecker =
  (handler: NextApiHandler) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const sdk = getSdk(req, res);
      const currentUserResponse = await sdk.currentUser.show();
      const { companyId, orderId } = req.body;
      const apiMethod = req.method;
      const [currentUser] = denormalisedResponseEntities(currentUserResponse);
      const { isAdmin = false } = USER(currentUser).getMetadata();
      const { company = {} } = USER(currentUser).getMetadata();
      switch (apiMethod) {
        case HTTP_METHODS.POST: {
          if (!companyId) {
            return res.status(403).json({
              message: 'Missing required key',
            });
          }

          const userPermission = company[companyId]?.permission;
          if (
            (userPermission && userPermission !== UserPermission.BOOKER) ||
            !isAdmin
          ) {
            return res.status(403).json({
              message: "You don't have permission to access this api!",
            });
          }
          break;
        }
        case HTTP_METHODS.PUT: {
          if (!orderId) {
            return res.status(403).json({
              message: 'Missing required key',
            });
          }
          const orderListing = await fetchListing(orderId);
          const { clientId } = LISTING(orderListing).getMetadata();
          const userPermission = company[clientId]?.permission;
          if (
            (userPermission && userPermission !== UserPermission.BOOKER) ||
            !isAdmin
          ) {
            return res.status(403).json({
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
