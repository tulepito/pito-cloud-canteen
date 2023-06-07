import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

import { EHttpStatusCode } from '@apis/errors';
import cookies from '@services/cookie';
import adminChecker from '@services/permissionChecker/admin';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { EListingStates } from '@src/utils/enums';
import { txIsDelivering } from '@src/utils/transaction';
import { denormalisedResponseEntities, User } from '@utils/data';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { id } = req.body;

    const integrationSdk = getIntegrationSdk();
    const [partnerUser] = denormalisedResponseEntities(
      await integrationSdk.users.show({
        id,
      }),
    ) || [{}];
    const { restaurantListingId: partnerListingId } =
      User(partnerUser).getMetadata();

    if (id) {
      const partnerListingTxsMaybe = denormalisedResponseEntities(
        (await integrationSdk.transactions.query({
          providerId: id,
        })) || [[]],
      );
      const hasAnyOrdersInProgress = partnerListingTxsMaybe?.some((tx: any) => {
        return !isEmpty(tx) && txIsDelivering(tx);
      });
      if (hasAnyOrdersInProgress) {
        return res
          .status(EHttpStatusCode.BadRequest)
          .json({ hasAnyOrdersInProgress: true });
      }
    }

    const updatedPartnerResponse = await integrationSdk.users.updateProfile(
      {
        id,
        metadata: {
          isDeleted: true,
        },
      },
      {
        expand: true,
      },
    );

    let restaurantListingResponse = null;
    if (partnerListingId) {
      restaurantListingResponse = await integrationSdk.listings.update(
        {
          id: partnerListingId,
          metadata: {
            listingState: EListingStates.closed,
            isDeleted: true,
          },
        },
        { expand: true },
      );
    }

    res.json({
      user: updatedPartnerResponse,
      listing: restaurantListingResponse,
    });
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(adminChecker(handler));
