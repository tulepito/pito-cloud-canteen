import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { denormalisedResponseEntities } from '@services/data';
import participantChecker from '@services/permissionChecker/participant';
import { getSdk, handleError } from '@services/sdk';
import type { RatingListing } from '@src/types';
import { EListingType } from '@src/utils/enums';
import { SuccessResponse } from '@src/utils/response';
import type { TPagination } from '@src/utils/types';

// Default route is for participant to get reviews
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const apiMethod = req.method;
  try {
    const sdk = getSdk(req, res);

    switch (apiMethod) {
      case HttpMethod.GET: {
        try {
          const { page = 1, perPage = 10 } = JSON.parse(
            req.query.JSONParams as string,
          ) as {
            page: number;
            perPage: number;
          };

          const currentUser = await sdk.currentUser.show();
          const [user] = denormalisedResponseEntities(currentUser);
          const reviewerId = user?.id?.uuid;
          if (!reviewerId) {
            return res.status(401).json({ message: 'Unauthorized' });
          }

          const response = await sdk.listings.query({
            meta_listingType: EListingType.rating,
            meta_reviewerId: reviewerId,
            page: Number(page),
            perPage: Number(perPage),
            include: ['images', 'author'],
          });

          const reviews: RatingListing[] =
            denormalisedResponseEntities(response);

          const reviewsWithReplies = reviews.map((review) => {
            const replies = review.attributes?.metadata?.replies || [];
            const validReplies = replies.filter(
              (reply) => reply?.status !== 'pending',
            );

            return {
              ...review,
              replies: validReplies,
              authorName: user.attributes.profile.displayName,
            };
          });

          const pagination: TPagination = {
            page: Number(page),
            perPage: Number(perPage),
            totalItems: response.data.meta?.totalItems || 0,
            totalPages: response.data.meta?.totalPages || 0,
          };

          return new SuccessResponse(reviewsWithReplies, {
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

export default cookies(participantChecker(handler));
