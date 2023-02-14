/* eslint-disable no-console */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { getIntegrationSdk } from '@services/integrationSdk';
import { getSdk, handleError } from '@services/sdk';
import { CurrentUser, Transaction } from '@utils/data';
import { merge } from 'lodash';
import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

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
          }

          const tx = await integrationSdk.transactions.show({ id: txId });
          const { reviews = {} } = Transaction(tx).getMetadata();
          const reviewsAtTime = reviews[time] || {};

          if (isEmpty(reviewsAtTime[participantId])) {
            res.status(400).json({
              error: `Participant ${participantId} has already reviewed`,
            });
          }

          await integrationSdk.transactions.updateMetadata({
            reviews: merge(reviews, {
              [time]: merge(reviewsAtTime, {
                [participantId]: {
                  reviewContent,
                  reviewRating,
                  authorId: participantId,
                },
              }),
            }),
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
