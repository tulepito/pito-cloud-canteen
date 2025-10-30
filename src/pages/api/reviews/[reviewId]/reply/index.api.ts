import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/integrationSdk';
import { getSdk, handleError } from '@services/sdk';
import type { RatingListing, TReviewReply } from '@src/types';
import { EUserRole } from '@src/utils/enums';
import { SuccessResponse } from '@src/utils/response';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const apiMethod = req.method;
  try {
    const sdk = getSdk(req, res);
    const integrationSdk = getIntegrationSdk();

    switch (apiMethod) {
      case HttpMethod.POST: {
        try {
          const { reviewId } = req.query;
          const { replyContent, replyRole } = req.body;

          if (!reviewId || !replyContent || !replyRole) {
            return res.status(400).json({
              error:
                'Review ID, author ID, reply content and reply role are required',
            });
          }

          const reviewResponse = await integrationSdk.listings.show({
            id: reviewId as string,
          });
          const [review]: RatingListing[] =
            denormalisedResponseEntities(reviewResponse);

          if (!review) {
            return res.status(404).json({
              error: 'Review not found',
            });
          }

          const authorUser = await sdk.currentUser.show();
          const [author] = denormalisedResponseEntities(authorUser);
          let replyObject: TReviewReply;
          if (replyRole === EUserRole.partner) {
            replyObject = {
              id: uuidv4(),
              authorId: author.id?.uuid || '',
              authorName: author.attributes.profile.displayName,
              replyRole,
              replyContent,
              repliedAt: new Date().getTime(),
              status: 'pending',
              approvedAt: undefined,
              approvedBy: undefined,
            };
          } else {
            replyObject = {
              id: uuidv4(),
              authorId: author.id?.uuid || '',
              authorName: author.attributes.profile.displayName,
              replyRole,
              replyContent,
              repliedAt: new Date().getTime(),
            };
          }

          await integrationSdk.listings.update({
            id: reviewId as string,
            metadata: {
              ...review?.attributes?.metadata,
              replies: [
                ...(review?.attributes?.metadata?.replies || []),
                replyObject,
              ],
            },
          });

          const newReviewResponse = await integrationSdk.listings.show({
            id: reviewId as string,
          });
          const [updatedReview] =
            denormalisedResponseEntities(newReviewResponse);

          return new SuccessResponse(updatedReview, {
            message: 'Reply created successfully',
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

export default cookies(handler);
