import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { fetchListing } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { getSdk, handleError } from '@services/sdk';
import {
  CurrentUser,
  denormalisedResponseEntities,
  Listing,
} from '@src/utils/data';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;

    switch (apiMethod) {
      case HttpMethod.PUT:
        {
          const { orderId } = req.query;
          const sdk = getSdk(req, res);
          const integrationSdk = getIntegrationSdk();
          const [currentUser] = denormalisedResponseEntities(
            await sdk.currentUser.show(),
          );

          const currentUserGetter = CurrentUser(currentUser);
          const currentUserId = currentUserGetter.getId();

          const order = await fetchListing(orderId as string);
          const orderGetter = Listing(order);
          const orderMetadata = orderGetter.getMetadata();
          const isParticipantViewedOrderFirstTime =
            orderMetadata?.[`hideFirstTimeOrderModal_${currentUserId}`];

          if (!isParticipantViewedOrderFirstTime) {
            await integrationSdk.listings.update({
              id: orderId,
              metadata: {
                [`hideFirstTimeOrderModal_${currentUserId}`]: true,
              },
            });
          }

          res.status(200).json({
            message: 'Update first time view order successfully',
          });
        }
        break;
      default:
        break;
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(handler);
