import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/integrationSdk';
import { Listing, Transaction } from '@utils/data';
import {
  ETransition,
  txIsCompleted,
  txIsExpiredReview,
} from '@utils/transaction';
import type { TTransaction, TTransactionReviews } from '@utils/types';

export const summarizeReviews = async ({
  tx,
  restaurantId,
  reviews,
}: {
  tx: TTransaction;
  restaurantId: string;
  reviews: TTransactionReviews;
}) => {
  const integrationSdk = getIntegrationSdk();
  const txId = Transaction(tx).getId();

  // Calculate average rating
  const totalReviews = Object.keys(reviews).length;
  const totalRatings = Object.values(reviews).reduce(
    (acc, { reviewRating: rating }) => acc + rating,
    0,
  );
  const averageRating = totalRatings / totalReviews;

  const isExpiredReviewTime = txIsExpiredReview(tx);
  const isCompleted = txIsCompleted(tx);
  const isEnableToReview = isExpiredReviewTime || isCompleted;

  if (!isEnableToReview) {
    throw new Error(
      `Cannot summarize transaction reviews ${txId} because transaction is not completed or expired review time`,
    );
  }

  // Update restaurant rating in publicData
  const [restaurantListing] = denormalisedResponseEntities(
    await integrationSdk.listings.show({ id: restaurantId }),
  );
  const {
    totalRatings: oldTotalRatings = 0,
    totalReviews: oldTotalReviews = 0,
  } = Listing(restaurantListing).getPublicData();

  await integrationSdk.listings.update({
    id: restaurantId,
    publicData: {
      rating: {
        totalRatings: totalRatings + oldTotalRatings,
        totalReviews: totalReviews + oldTotalReviews,
        averageRating:
          (totalRatings + oldTotalRatings) / (totalReviews + oldTotalReviews),
      },
    },
  });

  // Transit to review
  await integrationSdk.transactions.transition({
    id: txId,
    transition: isCompleted
      ? ETransition.REVIEW_RESTAURANT
      : ETransition.REVIEW_RESTAURANT_AFTER_EXPIRE_TIME,
    reviewContent: '',
    reviewRating: Math.floor(averageRating),
  });
};
