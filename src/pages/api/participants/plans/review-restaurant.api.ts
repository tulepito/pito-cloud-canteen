/* eslint-disable no-console */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/integrationSdk';
import { getSdk, handleError } from '@services/sdk';
import { CurrentUser, Listing, TransactionWithExtendedData } from '@utils/data';
import { txIsCompleted } from '@utils/transaction';
import { merge } from 'lodash';
import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

import { summarizeReviews } from './summarize-reviews.service';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const integrationSdk = getIntegrationSdk();
    const sdk = getSdk(req, res);

    switch (apiMethod) {
      case HttpMethod.GET:
        break;
      case HttpMethod.POST:
        {
          const currentUser = await sdk.currentUser.show();
          const participantId = CurrentUser(currentUser).getId();
          const { txId, reviewContent, reviewRating, time } = req.body;

          if (isEmpty(txId)) {
            res.status(400).json({
              error: 'Transaction ID is empty',
            });
            return;
          }

          const [tx] = denormalisedResponseEntities(
            await integrationSdk.transactions.show({
              id: txId,
              include: ['listing'],
            }),
          );
          const {
            reviews = {},
            participantIds = [],
            orderId,
          } = TransactionWithExtendedData(tx).getMetadata();
          const restaurant = TransactionWithExtendedData(tx).getListing();
          const restaurantId = Listing(restaurant).getId();

          const reviewsAtTime = reviews[time] || {};

          // Check permission
          if (!participantIds.includes(participantId)) {
            res.status(400).json({
              error: `Participant ${participantId} cannot review order ${orderId}`,
            });

            return;
          }

          // Check all participant review
          const totalReviews = Object.keys(reviewsAtTime).length;
          const totalEnableReviewParticipants = participantIds.length;

          if (totalReviews === totalEnableReviewParticipants) {
            res.status(400).json({
              error: `Order completed review process`,
            });

            return;
          }

          // Check if user reviewed or not
          if (isEmpty(reviewsAtTime[participantId])) {
            res.status(400).json({
              error: `Participant ${participantId} has already reviewed`,
            });

            return;
          }

          // Check if transaction is completed
          if (!txIsCompleted(tx)) {
            throw new Error(
              `Cannot review transaction ${txId} because transaction is not completed`,
            );
          }
          const newReviews = merge(reviews, {
            [time]: merge(reviewsAtTime, {
              [participantId]: {
                reviewContent,
                reviewRating,
                authorId: participantId,
              },
            }),
          });
          await integrationSdk.transactions.updateMetadata({
            id: txId,
            reviews: newReviews,
          });

          if (totalReviews === totalEnableReviewParticipants - 1) {
            await summarizeReviews({ tx, restaurantId, reviews: newReviews });
          }

          res.status(400).json({
            message: `Successfully reviewed tx ${txId} by participant ${participantId}`,
            data: { reviewContent, reviewRating },
          });
        }
        break;
      case HttpMethod.DELETE:
        break;
      case HttpMethod.PUT:
        break;
      default:
        break;
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(handler);
