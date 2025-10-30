import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/integrationSdk';
import { getSdk, handleError } from '@services/sdk';
import type { RatingListing } from '@src/types';
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

          await integrationSdk.listings.update({
            id: reviewId as string,
            metadata: {
              ...review?.attributes?.metadata,
              replies: [
                ...(review?.attributes?.metadata?.replies || []),
                {
                  ...review?.attributes?.metadata?.replies?.find(
                    (reply) =>
                      reply?.id === replyId &&
                      reply.replyRole === EUserRole.partner,
                  ),
                  status,
                  approvedAt: new Date().getTime(),
                  approvedBy: processor.id?.uuid || '',
                },
              ],
            },
          });

          const newReviewResponse = await integrationSdk.listings.show({
            id: reviewId as string,
          });
          const [updatedReview] =
            denormalisedResponseEntities(newReviewResponse);

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

export default cookies(handler);
