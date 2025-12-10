import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import publishDraftMenu from '@pages/api/apiServices/menu/publishDraftMenu.service';
import cookies from '@services/cookie';
import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/integrationSdk';
import partnerChecker from '@services/permissionChecker/partner';
import { getSdk, handleError } from '@services/sdk';
import { createSlackNotification } from '@services/slackNotification';
import { IntegrationListing, Listing } from '@src/utils/data';
import { buildFullNameFromProfile } from '@src/utils/emailTemplate/participantOrderPicking';
import {
  EListingMenuStates,
  EListingStates,
  ERestaurantListingStatus,
  ESlackNotificationType,
} from '@src/utils/enums';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const integrationSdk = getIntegrationSdk();
    const sdk = getSdk(req, res);

    const { dataParams = {}, queryParams = {} } = req.body;

    switch (apiMethod) {
      case HttpMethod.PUT: {
        const { id: menuId } = dataParams;
        const needPublishMenuIds = await publishDraftMenu(
          menuId,
          dataParams,
          queryParams,
        );
        const authorUser = await sdk.currentUser.show();
        const [author] = denormalisedResponseEntities(authorUser);
        const menuResponse = await integrationSdk.listings.show({
          id: menuId,
        });

        const [menu] = denormalisedResponseEntities(menuResponse);
        const { restaurantId, listingState: previousListingState } =
          IntegrationListing(menu).getMetadata();
        const restaurantResponse = await integrationSdk.listings.show({
          id: restaurantId,
        });

        const [restaurant] = denormalisedResponseEntities(restaurantResponse);

        const { status } = IntegrationListing(restaurant).getMetadata();
        if (status !== ERestaurantListingStatus.authorized) {
          await integrationSdk.listings.update({
            id: menuId,
            metadata: {
              listingState: EListingMenuStates.pendingRestaurantApproval,
            },
          });

          return res.json({
            message: 'Restaurant is not authorized. Menu will not be published',
          });
        }

        await integrationSdk.listings.update({
          id: menuId,
          metadata: {
            listingState: EListingStates.pendingApproval,
            menuStateHistory: [
              ...(Listing(menu).getMetadata()?.menuStateHistory || []),
              {
                state: EListingStates.pendingApproval,
                updatedAt: new Date().getTime(),
              },
            ],
          },
        });
        if (previousListingState !== EListingStates.pendingApproval) {
          await createSlackNotification(
            ESlackNotificationType.PARTNER_MENU_PUBLISHED_DRAFT_TO_PENDING,
            {
              menuPublishedDraftToPendingData: {
                menuName: menu.attributes?.title,
                restaurantName: buildFullNameFromProfile(
                  author.attributes?.profile,
                ),
                menuLink: `${process.env.NEXT_PUBLIC_CANONICAL_URL}/admin/partner/pending-menus/${menuId}`,
              },
            },
          );
        }

        await Promise.all(
          needPublishMenuIds.map(async (id: string) => {
            await integrationSdk.listings.update({
              id,
              publicData: {
                mealTypes: undefined,
              },
              metadata: {
                listingState: EListingStates.pendingApproval,
                menuStateHistory: [
                  ...(Listing(menu).getMetadata()?.menuStateHistory || []),
                  {
                    state: EListingStates.pendingApproval,
                    updatedAt: new Date().getTime(),
                  },
                ],
              },
            });
          }),
        );

        return res.status(200).json({});
      }

      default:
        break;
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(partnerChecker(handler));
