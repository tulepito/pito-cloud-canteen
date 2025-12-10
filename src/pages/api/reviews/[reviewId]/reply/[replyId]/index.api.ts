import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { denormalisedResponseEntities } from '@services/data';
import { emailSendingFactory, EmailTemplateTypes } from '@services/email';
import { fetchListing, fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { createNativeNotification } from '@services/nativeNotification';
import { createFirebaseDocNotification } from '@services/notifications';
import adminChecker from '@services/permissionChecker/admin';
import { getSdk, handleError } from '@services/sdk';
import { createSlackNotification } from '@services/slackNotification';
import type { RatingListing, TReviewReply } from '@src/types';
import { Listing, User } from '@src/utils/data';
import {
  ENativeNotificationType,
  ENotificationType,
  ESlackNotificationType,
  EUserRole,
} from '@src/utils/enums';
import { SuccessResponse } from '@src/utils/response';

type TPostReplyReview = {
  status: 'approved' | 'rejected';
};

type TPostReplyReviewQuery = {
  reviewId: string;
  replyId: string;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const apiMethod = req.method;
  try {
    const sdk = getSdk(req, res);
    const integrationSdk = getIntegrationSdk();

    switch (apiMethod) {
      case HttpMethod.POST: {
        try {
          const { reviewId, replyId } = req.query as TPostReplyReviewQuery;
          const { status } = req.body as TPostReplyReview;

          if (!reviewId || !replyId || !status) {
            return res.status(400).json({
              error: 'Review ID, reply ID and status are required',
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

          const processorUser = await sdk.currentUser.show();
          const [processor] = denormalisedResponseEntities(processorUser);

          const partnerReply = review?.attributes?.metadata?.replies?.find(
            (reply) =>
              reply?.id === replyId && reply.replyRole === EUserRole.partner,
          );

          if (!partnerReply) {
            return res.status(404).json({
              error: 'Partner reply not found',
            });
          }

          const updatedReplies = (
            review?.attributes?.metadata?.replies || []
          ).map((reply) =>
            reply?.id === replyId && reply.replyRole === EUserRole.partner
              ? {
                  ...reply,
                  status,
                  approvedAt: new Date().getTime(),
                  approvedBy: processor.id?.uuid || '',
                }
              : reply,
          );

          await integrationSdk.listings.update({
            id: reviewId,
            metadata: {
              ...review?.attributes?.metadata,
              replies: updatedReplies,
            },
          });

          const newReviewResponse = await integrationSdk.listings.show({
            id: reviewId,
          });
          const [updatedReview] =
            denormalisedResponseEntities(newReviewResponse);

          // Send email and native notification to participant if partner reply is approved
          if (status === 'approved') {
            const reviewListing = Listing(updatedReview);
            const { foodName, restaurantId, reviewerId } =
              reviewListing.getMetadata();
            const reviewer = await fetchUser(reviewerId);
            const reviewerUser = reviewer ? User(reviewer) : null;
            const reviewerName =
              reviewerUser?.getProfile()?.displayName || 'Người dùng';
            let partnerName = partnerReply.authorName;
            if (restaurantId) {
              try {
                const restaurant = await fetchListing(restaurantId);
                const restaurantListing = Listing(restaurant);
                const restaurantTitle =
                  restaurantListing.getPublicData()?.title;
                if (restaurantTitle) {
                  partnerName = restaurantTitle;
                }
              } catch (error) {
                console.error('Error fetching restaurant:', error);
              }
            }

            const results = await Promise.allSettled([
              emailSendingFactory(
                EmailTemplateTypes.PARTICIPANT.PARTICIPANT_REVIEW_REPLY,
                {
                  reviewId,
                  replyContent: partnerReply.replyContent,
                  replyAuthorName: partnerReply.authorName,
                  foodName,
                  isPartnerReply: true,
                  partnerName,
                },
              ),
              createNativeNotification(
                ENativeNotificationType.AdminApprovePartnerReplyReview,
                {
                  participantId: reviewerId,
                  reviewId,
                  replyContent: partnerReply.replyContent,
                  foodName,
                  partnerName,
                },
              ),
              createFirebaseDocNotification(
                ENotificationType.PARTNER_REPLY_REVIEW,
                {
                  userId: reviewerId,
                  subOrderDate: Number(review.attributes?.metadata?.timestamp),
                  foodName,
                  planId,
                  partnerName,
                },
              ),
              createFirebaseDocNotification(
                ENotificationType.ADMIN_APPROVE_PARTNER_REPLY_REVIEW,
                {
                  userId: partnerReply.authorId || '',
                  subOrderDate: Number(review.attributes?.metadata?.timestamp),
                  foodName,
                  planId,
                },
              ),
              createSlackNotification(
                ESlackNotificationType.ADMIN_APPROVE_PARTNER_REPLY_REVIEW,
                {
                  adminApprovePartnerReplyReviewData: {
                    reviewId,
                    reviewLink: `${process.env.NEXT_PUBLIC_CANONICAL_URL}/admin/reviews`,
                    partnerName: partnerReply.authorName || '',
                    replyContent: partnerReply.replyContent || '',
                    foodName,
                    reviewerName,
                    orderCode: order?.attributes?.title,
                    threadTs: review?.attributes?.metadata?.slackThreadTs,
                  },
                },
              ),
            ]);

            results.forEach((result, idx) => {
              if (result.status === 'rejected') {
                console.error(
                  `Notification promise ${idx} failed:`,
                  result.reason,
                );
              }
            });
          }

          const replies: TReviewReply[] =
            updatedReview?.attributes?.metadata?.replies || [];
          const validReplies = replies.filter(
            (reply) => reply?.status !== 'rejected',
          );
          updatedReview.attributes!.metadata!.replies = validReplies;

          return new SuccessResponse({
            data: updatedReview,
            message: 'Reply processed successfully',
          }).send(res);
        } catch (error) {
          console.error('Error in process reply:', error);
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

export default cookies(adminChecker(handler));
