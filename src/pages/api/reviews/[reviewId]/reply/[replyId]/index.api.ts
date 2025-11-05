import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { denormalisedResponseEntities } from '@services/data';
import { emailSendingFactory, EmailTemplateTypes } from '@services/email';
import { fetchListing } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import adminChecker from '@services/permissionChecker/admin';
import { getSdk, handleError } from '@services/sdk';
import type { RatingListing, TReviewReply } from '@src/types';
import { Listing } from '@src/utils/data';
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
          const { reviewId, replyId } = req.query;
          const { status } = req.body;

          if (!reviewId || !replyId || !status) {
            return res.status(400).json({
              error: 'Review ID, reply ID and status are required',
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
            id: reviewId as string,
            metadata: {
              ...review?.attributes?.metadata,
              replies: updatedReplies,
            },
          });

          const newReviewResponse = await integrationSdk.listings.show({
            id: reviewId as string,
          });
          const [updatedReview] =
            denormalisedResponseEntities(newReviewResponse);

          // Send email to participant if partner reply is approved
          if (status === 'approved') {
            const reviewListing = Listing(updatedReview);
            const { foodName, restaurantId } = reviewListing.getMetadata();
            try {
              // Fetch restaurant to get partner name
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
                  // Use author name as fallback
                }
              }

              await emailSendingFactory(
                EmailTemplateTypes.PARTICIPANT.PARTICIPANT_REVIEW_REPLY,
                {
                  reviewId: reviewId as string,
                  replyContent: partnerReply.replyContent,
                  replyAuthorName: partnerReply.authorName,
                  foodName,
                  isPartnerReply: true,
                  partnerName,
                },
              );
            } catch (error) {
              console.error(
                'Error sending email for approved partner reply:',
                error,
              );
              // Don't fail the request if email sending fails
            }
          }

          const replies: TReviewReply[] =
            updatedReview?.attributes?.metadata?.replies || [];
          const validReplies = replies.filter(
            (reply) => reply?.status !== 'rejected',
          );
          updatedReview.attributes!.metadata!.replies = validReplies;

          return new SuccessResponse(updatedReview, {
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
