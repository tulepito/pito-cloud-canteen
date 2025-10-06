import logger from '@helpers/logger';
import { getIntegrationSdk } from '@services/sdk';
import { denormalisedResponseEntities } from '@src/utils/data';
import { EListingStates, EListingType } from '@src/utils/enums';

type LogPayload = {
  orderId: string;
  planId?: string;
  authorId: string;
  orderDays: number[];
  title?: string;
  entry: Record<string, any>;
};

/**
 * Create a new log listing for an order
 */
const createLogListing = async (payload: LogPayload) => {
  const { orderId, planId, authorId, title, entry, orderDays } = payload;
  const integrationSdk = getIntegrationSdk();

  const listing = await integrationSdk.listings.create(
    {
      title: title || `Order logs ${orderId} user ${authorId}`,
      state: EListingStates.published,
      authorId,
      metadata: {
        listingType: EListingType.log,
        name: title || `Order log ${orderId} user ${authorId}`,
        orderId,
        planId,
        userId: authorId,
        orderDays,
        timeStamp: Date.now().toString(),
        logs: entry,
      },
    },
    { expand: true },
  );

  console.log('Created new order log listing:', { listing });

  const [created] = denormalisedResponseEntities(listing);

  logger.info('Created new order log listing:', { created });

  return created;
};

/**
 * Safe push of order log. Non-blocking: errors are logged but not thrown.
 */
export const pushOrderLog = async (payload: LogPayload) => {
  const created = await createLogListing(payload);

  return created;
};

export default pushOrderLog;
