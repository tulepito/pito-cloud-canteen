import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

import { HttpMethod } from '@apis/configs';
import { EHttpStatusCode } from '@apis/errors';
import cookies from '@services/cookie';
import { denormalisedResponseEntities } from '@services/data';
import { emailSendingFactory, EmailTemplateTypes } from '@services/email';
import { fetchListing, fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { createNativeNotification } from '@services/nativeNotification';
import { createFirebaseDocNotification } from '@services/notifications';
import participantChecker from '@services/permissionChecker/participant';
import { getSdk, handleError } from '@services/sdk';
import { createSlackNotification } from '@services/slackNotification';
import type { RatingListing, TReviewReply } from '@src/types';
import { CurrentUser, Listing, User } from '@src/utils/data';
import {
  ENativeNotificationType,
  ENotificationType,
  EPartnerReply,
  ESlackNotificationType,
  EUserRole,
} from '@src/utils/enums';
import { SuccessResponse } from '@src/utils/response';

type TPostReplyReviewQuery = {
  reviewId: string;
};

type TPostReplyReview = {
  replyContent: string;
  replyRole: EUserRole;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const apiMethod = req.method;
  try {
    const sdk = getSdk(req, res);
    const integrationSdk = getIntegrationSdk();

    switch (apiMethod) {
      case HttpMethod.POST: {
        try {
          const { reviewId } = req.query as TPostReplyReviewQuery;
          const { replyContent, replyRole } = req.body as TPostReplyReview;

          if (!reviewId || !replyContent || !replyRole) {
            return res.status(400).json({
              error:
                'Review ID, author ID, reply content and reply role are required',
            });
          }

          const reviewResponse = await integrationSdk.listings.show({
            id: reviewId,
          });
          const [review]: RatingListing[] =
            denormalisedResponseEntities(reviewResponse);

          if (!review) {
            return res.status(404).json({
              error: 'Review not found',
            });
          }

          const orderResponse = await integrationSdk.listings.show({
            id: review.attributes?.metadata?.orderId,
          });
          const [order] = denormalisedResponseEntities(orderResponse);
          const planId = Listing(order).getMetadata().plans[0];

          const authorUser = await sdk.currentUser.show();
          const [author] = denormalisedResponseEntities(authorUser);
          const { isAdmin = false, isPartner = false } =
            CurrentUser(author).getMetadata();

          if (!isAdmin && !isPartner) {
            return res.status(EHttpStatusCode.Forbidden).json({
              message: "You don't have permission to access this api!",
            });
          }

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
              authorId: author.id?.uuid,
              authorName: author.attributes.profile.displayName,
              replyRole,
              replyContent,
              repliedAt: new Date().getTime(),
              status: 'pending',
              approvedAt: undefined,
              approvedBy: undefined,
            };
          } else {
            // ADMIN reply
            replyObject = {
              id: uuidv4(),
              authorId: author.id?.uuid,
              authorName: 'PITO Cloud Canteen',
              replyRole,
              replyContent,
              repliedAt: new Date().getTime(),
            };
          }

          await integrationSdk.listings.update({
            id: reviewId,
            metadata: {
              ...review?.attributes?.metadata,
              replies: [
                ...(review?.attributes?.metadata?.replies || []),
                replyObject,
              ],
              ...(replyRole === EUserRole.partner && {
                partnerReplyStatus: EPartnerReply.pending,
              }),
            },
          });

          const newReviewResponse = await integrationSdk.listings.show({
            id: reviewId,
          });
          const [updatedReview] =
            denormalisedResponseEntities(newReviewResponse);
          const reviewListing = Listing(updatedReview);
          const { foodName, reviewerId } = reviewListing.getMetadata();
          const BASE_URL = process.env.NEXT_PUBLIC_CANONICAL_URL;
          const reviewLink = `${BASE_URL}/admin/reviews`;
          // Fetch reviewer and restaurant info
          const reviewer = await fetchUser(reviewerId);

          const reviewerUser = reviewer ? User(reviewer) : null;
          const reviewerName =
            reviewerUser?.getProfile()?.displayName || 'Người dùng';

          // Send email and native notification to participant if admin replied
          if (replyRole === EUserRole.admin) {
            const results = await Promise.allSettled(
              [
                emailSendingFactory(
                  EmailTemplateTypes.PARTICIPANT.PARTICIPANT_REVIEW_REPLY,
                  {
                    reviewId,
                    replyContent,
                    replyAuthorName: 'PITO Cloud Canteen',
                    foodName,
                    isPartnerReply: false,
                  },
                ),
                createNativeNotification(
                  ENativeNotificationType.AdminReplyReview,
                  {
                    participantId: reviewerId,
                    reviewId,
                    replyContent,
                    foodName,
                  },
                ),
                review.attributes?.metadata?.timestamp &&
                  createFirebaseDocNotification(
                    ENotificationType.ADMIN_REPLY_REVIEW,
                    {
                      userId: reviewerId,
                      subOrderDate: Number(
                        review.attributes?.metadata?.timestamp,
                      ),
                      foodName,
                      planId,
                    },
                  ),
                createSlackNotification(
                  ESlackNotificationType.ADMIN_REPLY_REVIEW,
                  {
                    adminReplyReviewData: {
                      reviewId,
                      reviewLink,
                      replyContent,
                      foodName,
                      reviewerName,
                      orderCode: order?.attributes?.title,
                      threadTs: review?.attributes?.metadata?.slackThreadTs,
                    },
                  },
                ),
              ].filter(Boolean),
            );

            results.forEach((result, idx) => {
              if (result.status === 'rejected') {
                console.error(
                  `Notification promise ${idx} failed:`,
                  result.reason,
                );
              }
            });
          }

          // Send Slack notification to admin if partner replied -> need approval from admin
          if (replyRole === EUserRole.partner) {
            const { restaurantId, orderCode } = reviewListing.getMetadata();
            try {
              // Fetch reviewer and restaurant info
              const restaurant = await fetchListing(restaurantId);
              const restaurantListing = restaurant ? Listing(restaurant) : null;
              const partnerName =
                restaurantListing?.getPublicData()?.title ||
                author.attributes.profile.displayName;
              await createSlackNotification(
                ESlackNotificationType.PARTNER_REPLY_REVIEW,
                {
                  partnerReplyReviewData: {
                    reviewId,
                    reviewLink,
                    partnerName,
                    replyContent,
                    foodName,
                    reviewerName,
                    orderCode,
                    threadTs: review?.attributes?.metadata?.slackThreadTs,
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
          console.error('Error in POST reply:', error);
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
