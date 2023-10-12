import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { MANAGE_FOOD_PAGE_SIZE } from '@pages/partner/products/food/PartnerFood.slice';
import cookies from '@services/cookie';
import partnerChecker from '@services/permissionChecker/partner';
import { getIntegrationSdk, getSdk, handleError } from '@services/sdk';
import { CurrentUser, denormalisedResponseEntities } from '@src/utils/data';
import { EImageVariants, EListingStates, EListingType } from '@src/utils/enums';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const integrationSdk = getIntegrationSdk();
    const sdk = getSdk(req, res);

    const [currentUser] = denormalisedResponseEntities(
      await sdk.currentUser.show(),
    );
    const currentUserGetter = CurrentUser(currentUser);

    switch (apiMethod) {
      case HttpMethod.GET: {
        const { JSONParams } = req.query;
        const {
          restaurantId,
          keywords,
          foodType,
          createAtStart,
          createAtEnd,
          page = 1,
          adminApproval,
          isDraft,
        } = JSON.parse(JSONParams as string);
        const { restaurantListingId } = currentUserGetter.getMetadata();

        const response = await integrationSdk.listings.query({
          page,
          ...(keywords && { keywords }),
          ...(foodType && { pub_foodType: foodType }),
          ...(createAtStart && {
            createdAtStart: new Date(+createAtStart).toISOString(),
          }),
          ...(createAtEnd && {
            createdAtEnd: new Date(+createAtEnd).toISOString(),
          }),
          meta_listingType: EListingType.food,
          meta_restaurantId: restaurantId || restaurantListingId,
          meta_isDeleted: false,
          perPage: MANAGE_FOOD_PAGE_SIZE,
          ...(adminApproval && {
            meta_adminApproval: adminApproval,
          }),
          ...(isDraft !== undefined && {
            meta_isDraft: isDraft,
          }),
          include: ['images'],
          'fields.image': [`variants.${EImageVariants.squareSmall2x}`],
        });

        return res.status(200).json({
          foodList: denormalisedResponseEntities(response),
          managePartnerFoodPagination: response.data.meta,
        });
      }
      case HttpMethod.POST: {
        const { dataParams, queryParams = {} } = req.body;
        const { restaurantListingId } = currentUserGetter.getMetadata();

        const restaurantRes = await integrationSdk.listings.show({
          id: restaurantListingId,
          include: ['author'],
        });
        const [restaurant] = denormalisedResponseEntities(restaurantRes);
        const response = await integrationSdk.listings.create(
          {
            ...dataParams,
            state: EListingStates.published,
            authorId: restaurant.author.id.uuid,
          },
          queryParams,
        );

        return res.status(200).json(denormalisedResponseEntities(response)[0]);
      }

      default:
        return res.status(400).json({ message: 'Bad request' });
    }
  } catch (error) {
    console.log(error);
    handleError(res, error);
  }
}

export default cookies(partnerChecker(handler));
