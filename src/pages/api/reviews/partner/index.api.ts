import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { denormalisedResponseEntities } from '@services/data';
import partnerChecker from '@services/permissionChecker/partner';
import { getIntegrationSdk, getSdk, handleError } from '@services/sdk';
import type { RatingListing } from '@src/types';
import { CurrentUser } from '@src/utils/data';
import { buildFullNameFromProfile } from '@src/utils/emailTemplate/participantOrderPicking';
import { EListingType } from '@src/utils/enums';
import { SuccessResponse } from '@src/utils/response';
import type { TPagination } from '@src/utils/types';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const apiMethod = req.method;
  try {
    const sdk = getSdk(req, res);
    const integrationSdk = getIntegrationSdk();

    switch (apiMethod) {
      case HttpMethod.GET: {
        try {
          const {
            page = 1,
            perPage = 10,
            ratings = [1, 2, 3, 4, 5],
          } = JSON.parse(req.query.JSONParams as string) as {
            page: number;
            perPage: number;
            ratings: number[] | undefined;
          };

          const currentUserRes = await sdk.currentUser.show();
          const [companyAccount] = denormalisedResponseEntities(currentUserRes);
          const { restaurantListingId: restaurantId } =
            CurrentUser(companyAccount).getMetadata();
          if (!restaurantId) {
            return res.status(401).json({ message: 'Unauthorized' });
          }
          const ratingString = ratings?.join(',');
          const response = await sdk.listings.query({
            meta_listingType: EListingType.rating,
            meta_restaurantId: restaurantId,
            page: Number(page),
            perPage: Number(perPage),
            meta_generalRatingValue: `has_any:${ratingString}`,
            include: ['images', 'author'],
          });

          const reviews: RatingListing[] =
            denormalisedResponseEntities(response);

          const reviewsWithReplies = await Promise.all(
            reviews.map(async (review) => {
              const metadata = review.attributes?.metadata;
              const authorId = metadata?.reviewerId;
              const author = await integrationSdk.users.show({
                id: authorId as string,
                include: ['profileImage'],
              });
              const [authorData] = denormalisedResponseEntities(author);

              const fullName = buildFullNameFromProfile(
                authorData.attributes.profile,
              );

              return {
                ...review,
                authorName: fullName,
              };
            }),
          );

          const pagination: TPagination = {
            page: Number(page),
            perPage: Number(perPage),
            totalItems: response.data.meta?.totalItems || 0,
            totalPages: response.data.meta?.totalPages || 0,
          };

          return new SuccessResponse({
            data: reviewsWithReplies,
            message: 'Get reviews successfully',
            pagination,
          }).send(res);
        } catch (error) {
          console.error('Error in GET reviews:', error);
          handleError(res, error);
        }
        break;
      }
      default:
        res.status(405).json({ message: 'Method not allowed' });
        break;
    }
  } catch (error) {
    console.error('Error in handler:', error);
    res.status(500).json({
      error: (error as Error).message,
      message: 'Internal server error',
    });
  }
};

export default cookies(partnerChecker(handler));
