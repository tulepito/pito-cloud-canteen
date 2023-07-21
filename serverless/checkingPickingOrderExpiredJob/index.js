const { mapLimit } = require('async');
const { denormalisedResponseEntities } = require('./utils/data');
const { diffDays } = require('./utils/dates');
const { Listing } = require('./utils/normalizeEntity');
const { getIntegrationSdk } = require('./utils/sdk');
const { queryAllListings } = require('./utils/queryAll');

const EXPIRED_PICKING_ORDER_DAYS_NUMBER = 60 * 60 * 24 * 10 * 1000;
const TODAY_AS_TIMESTAMP = new Date().getTime();

module.exports.run = async (_, context) => {
  const time = new Date();
  console.log(`Your cron function "${context.functionName}" ran at ${time}`);

  try {
    const integrationSdk = getIntegrationSdk();

    const listings = await queryAllListings({
      query: {
        meta_orderState: 'picking',
      },
    });

    const listingsToUpdate = listings.filter((l) => {
      const listingController = Listing(l);
      const { orderStateHistory = [] } = listingController.getMetadata();

      const stateDetails = orderStateHistory.find((i) => i.state === 'picking');

      const { updatedAt = 0 } = stateDetails || {};

      const reachMaxPickingDate =
        diffDays(TODAY_AS_TIMESTAMP, updatedAt).milliseconds >
        EXPIRED_PICKING_ORDER_DAYS_NUMBER;
      return reachMaxPickingDate;
    });

    console.log(`listingsToUpdate : `, listingsToUpdate);

    await mapLimit(listingsToUpdate, 10, async (listing) => {
      const listingId = Listing(listing).getId();
      const { orderStateHistory = [] } = Listing(listing).getMetadata();

      try {
        const response = await integrationSdk.listings.update({
          id: listingId,
          metadata: {
            orderState: 'expiredStart',
            orderStateHistory: [
              ...orderStateHistory,
              {
                state: 'expiredStart',
                updatedAt: new Date().getTime(),
              },
            ],
          },
        });
        return response;
      } catch (error) {
        console.error(`update order failed listingId : ${listingId} `, {
          error,
        });
      }
    });
    console.log(`Your cron function "${context.functionName}" DONE :`);
  } catch (error) {
    console.error(
      `Your cron function "${context.functionName}" ran at ${time} got ERROR : `,
      { error },
    );
  }
};
