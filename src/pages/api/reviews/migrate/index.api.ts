/* eslint-disable no-await-in-loop */
import type { NextApiRequest, NextApiResponse } from 'next';

import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/sdk';
import type { RatingListing } from '@src/types';
import { EListingType } from '@src/utils/enums';
import { SuccessResponse } from '@src/utils/response';

const DELAY_BETWEEN_PAGES_MS = 500; // Delay to avoid rate limiting
const DELAY_BETWEEN_UPDATES_MS = 50; // Delay between individual updates
const PER_PAGE = 50; // Increased from 10 to reduce API calls
const MAX_RETRIES = 3;
const BATCH_SIZE = 10; // Process updates in smaller batches

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });

const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES,
  baseDelay = 1000,
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    const delayMs = baseDelay * (MAX_RETRIES - retries + 1);
    await delay(delayMs);

    return retryWithBackoff(fn, retries - 1, baseDelay);
  }
};

const processBatch = async (
  batch: RatingListing[],
  integrationSdk: any,
): Promise<{
  successful: number;
  skipped: number;
  failed: Array<{ id?: string; error: string }>;
}> => {
  const results = {
    successful: 0,
    skipped: 0,
    failed: [] as Array<{ id?: string; error: string }>,
  };

  await batch.reduce(async (prevPromise, listing) => {
    await prevPromise;

    try {
      const id = listing.id?.uuid;
      const metadata = listing.attributes?.metadata || {};
      const ratingNumber = metadata?.generalRating;
      const generalRatingValue = metadata?.generalRatingValue;

      if (!ratingNumber) {
        results.skipped++;
      } else if (generalRatingValue) {
        results.skipped++;
      } else {
        // Fetch full listing to ensure we have complete metadata
        const fullListingResponse = await integrationSdk.listings.show({
          id,
        });
        const [fullListing] = denormalisedResponseEntities(fullListingResponse);
        const fullMetadata = fullListing?.attributes?.metadata || {};

        await retryWithBackoff(async () => {
          await integrationSdk.listings.update({
            id,
            metadata: {
              ...fullMetadata,
              generalRatingValue: [String(ratingNumber)],
            },
          });
        });

        results.successful++;
        console.log(`🟢 Updated listing ${id} → ${ratingNumber}`);
      }

      // Small delay between updates
      await delay(DELAY_BETWEEN_UPDATES_MS);
    } catch (error) {
      const err = error as Error;
      const listingId = listing.id?.uuid || 'unknown';
      results.failed.push({
        id: listingId,
        error: err.message || String(error),
      });
      console.error(`❌ Failed to update listing ${listingId}:`, err.message);
    }
  }, Promise.resolve());

  return results;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const integrationSdk = getIntegrationSdk();
    const startPage = parseInt(req.query.startPage as string, 10) || 1;

    let page = startPage;
    let totalPages = 1;
    let updatedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;
    const errors: any[] = [];
    const startTime = Date.now();

    do {
      const response = await integrationSdk.listings.query({
        meta_listingType: EListingType.rating,
        page,
        perPage: PER_PAGE,
        include: ['images', 'author'],
      });

      const reviews: RatingListing[] = denormalisedResponseEntities(response);
      totalPages = response.data.meta?.totalPages || 1;
      const currentPage = page;

      // Process reviews in smaller batches to avoid overwhelming the API
      const batches: RatingListing[][] = [];
      let batchIndex = 0;
      while (batchIndex < reviews.length) {
        batches.push(reviews.slice(batchIndex, batchIndex + BATCH_SIZE));
        batchIndex += BATCH_SIZE;
      }

      const pageErrors: Array<{
        page: number;
        listingId?: string;
        message: string;
      }> = [];
      let pageUpdatedCount = 0;
      let pageSkippedCount = 0;
      let pageFailedCount = 0;

      await batches.reduce(async (prevPromise, batch) => {
        await prevPromise;

        const batchResults = await processBatch(batch, integrationSdk);

        pageUpdatedCount += batchResults.successful;
        pageSkippedCount += batchResults.skipped;
        pageFailedCount += batchResults.failed.length;

        batchResults.failed.forEach((failure) => {
          pageErrors.push({
            page: currentPage,
            listingId: failure.id,
            message: failure.error,
          });
        });
      }, Promise.resolve());

      updatedCount += pageUpdatedCount;
      skippedCount += pageSkippedCount;
      failedCount += pageFailedCount;
      errors.push(...pageErrors);

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const progress = ((page / totalPages) * 100).toFixed(1);
      console.log(
        `✅ Page ${page}/${totalPages} (${progress}%) - Updated: ${updatedCount}, Skipped: ${skippedCount}, Failed: ${failedCount} | Elapsed: ${elapsed}s`,
      );

      page++;

      // Add delay between pages to avoid rate limiting (except for last page)
      if (page <= totalPages) {
        await delay(DELAY_BETWEEN_PAGES_MS);
      }
    } while (page <= totalPages);

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

    return new SuccessResponse(
      {
        updatedCount,
        skippedCount,
        failedCount,
        totalPages,
        totalTime: `${totalTime}s`,
        errors: errors.length > 0 ? errors : undefined,
      },
      {
        message: `Migration complete. Updated ${updatedCount} listings in ${totalTime}s.`,
      },
    ).send(res);
  } catch (error) {
    console.error('🔥 Migration failed:', error);
    res.status(500).json({
      error: (error as Error).message,
      message: 'Internal server error',
    });
  }
};

export default handler;
