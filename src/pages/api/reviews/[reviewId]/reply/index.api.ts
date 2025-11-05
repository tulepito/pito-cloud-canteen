import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { denormalisedResponseEntities } from '@services/data';
import { emailSendingFactory, EmailTemplateTypes } from '@services/email';
import { fetchListing, fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { getSdk, handleError } from '@services/sdk';
import { createSlackNotification } from '@services/slackNotification';
import type { RatingListing, TReviewReply } from '@src/types';
import { Listing, User } from '@src/utils/data';
import { ESlackNotificationType, EUserRole } from '@src/utils/enums';
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

          // Check if author is partner -> if yes, then check if partner had responded to this review before
          if (replyRole === EUserRole.partner) {
            const metadata = review.attributes?.metadata;
            const replies = metadata?.replies || [];
            const partnerReply = replies.find(
              (reply) =>
                reply?.replyRole === EUserRole.partner &&
                reply?.authorId === author.id?.uuid,
            );
            if (partnerReply) {
              return res.status(400).json({
                error: 'Partner already have replied to this review',
              });
            }
          }
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

          // Send email to participant if admin replied
          if (replyRole === EUserRole.admin) {
            const reviewListing = Listing(updatedReview);
            const { foodName } = reviewListing.getMetadata();
            try {
              await emailSendingFactory(
                EmailTemplateTypes.PARTICIPANT.PARTICIPANT_REVIEW_REPLY,
                {
                  reviewId: reviewId as string,
                  replyContent,
                  replyAuthorName: author.attributes.profile.displayName,
                  foodName,
                  isPartnerReply: false,
                },
              );
            } catch (error) {
              console.error('Error sending email for admin reply:', error);
              // Don't fail the request if email sending fails
            }
          }

          // Send Slack notification to admin if partner replied
          if (replyRole === EUserRole.partner) {
            const reviewListing = Listing(updatedReview);
            const {
              foodName,
              generalRating,
              reviewerId,
              restaurantId,
              orderCode,
            } = reviewListing.getMetadata();
            try {
              const BASE_URL = process.env.NEXT_PUBLIC_CANONICAL_URL;
              const reviewLink = `${BASE_URL}/admin/reviews`;

              // Fetch reviewer and restaurant info
              const [reviewer, restaurant] = await Promise.all([
                fetchUser(reviewerId),
                restaurantId ? fetchListing(restaurantId) : null,
              ]);

              const reviewerUser = reviewer ? User(reviewer) : null;
              const reviewerName =
                reviewerUser?.getProfile()?.displayName || 'Người dùng';
              const restaurantListing = restaurant ? Listing(restaurant) : null;
              const partnerName =
                restaurantListing?.getPublicData()?.title ||
                author.attributes.profile.displayName;

              await createSlackNotification(
                ESlackNotificationType.PARTNER_REPLY_REVIEW,
                {
                  partnerReplyReviewData: {
                    reviewId: reviewId as string,
                    reviewLink,
                    partnerName,
                    replyContent,
                    foodName,
                    reviewerName,
                    ratingScore: generalRating || 0,
                    orderCode: orderCode || '',
                  },
                },
              );
            } catch (error) {
              console.error(
                'Error sending Slack notification for partner reply:',
                error,
              );
              // Don't fail the request if Slack notification fails
            }
          }

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
