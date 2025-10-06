const isEmpty = require('lodash/isEmpty');
const axios = require('axios');
const getIntegrationSdk = require('./utils/sdk');
const { denormalisedResponseEntities, Listing } = require('./utils/data');
const deepEqual = require('./utils/equal');
const config = require('./utils/config');

exports.handler = async (event = {}) => {
  const integrationSdk = getIntegrationSdk();

  let orderIds = [];
  if (event.orderId) {
    orderIds = [event.orderId];
  } else {
    const allOrderRes = await integrationSdk.listings.query({
      meta_listingType: 'order',
      meta_orderState: 'picking',
    });

    const allOrderListings = denormalisedResponseEntities(allOrderRes) || [];
    orderIds = allOrderListings.map((o) => o?.id?.uuid).filter(Boolean);
  }

  if (orderIds.length === 0) {
    return { status: 'error', message: 'No order listings to check' };
  }

  const processOrder = async (orderId) => {
    if (isEmpty(orderId)) {
      return { status: 'error', message: 'Missing orderId' };
    }

    try {
      const [orderListing] = denormalisedResponseEntities(
        await integrationSdk.listings.show({ id: orderId }),
      );

      if (!orderListing) {
        return;
      }

      const planId = orderListing.attributes?.metadata?.plans?.[0];
      if (!planId) {
        return;
      }

      const [planListing] = denormalisedResponseEntities(
        await integrationSdk.listings.show({ id: planId }),
      );

      const orderMeta = Listing(orderListing).getMetadata() || {};
      const planMeta = Listing(planListing).getMetadata() || {};

      const logsRes = await integrationSdk.listings.query({
        meta_listingType: 'log',
        meta_orderId: orderId,
        meta_planId: planId,
      });

      const logListings = denormalisedResponseEntities(logsRes) || [];

      if (logListings.length === 0) {
        return;
      }

      // Keep the newest log listing per userId using a Map for O(n) behavior.
      // Store { log, ts } so we compute Date only once per log.
      const byUser = new Map();
      logListings.forEach((log) => {
        const meta = log.attributes?.metadata || {};
        const userId = meta.userId || '';
        const ts = Number(new Date(meta.timeStamp || 0).getTime()) || 0;
        const prev = byUser.get(userId);
        if (!prev || prev.ts < ts) {
          byUser.set(userId, { log, ts });
        }
      });

      const filteredLogListings = Array.from(byUser.values())
        .sort((a, b) => a.ts - b.ts)
        .map((x) => x.log);

      const participants = orderMeta.participants || [];

      const expectedOrderDetail = filteredLogListings.reduce((acc, log) => {
        const logMeta = log.attributes?.metadata || {};
        const logsByTime = logMeta.logs || {};

        Object.keys(logsByTime).forEach((time) => {
          const memberOrders = logsByTime[time] || {};
          const prevOrders = acc[time]?.memberOrders || {};
          const merged = { ...prevOrders, ...memberOrders };

          const defaults = participants.reduce((pAcc, p) => {
            if (!(p in merged)) {
              pAcc[p] = { foodId: '', requirement: '', status: 'empty' };
            }

            return pAcc;
          }, {});

          acc[time] = { memberOrders: { ...merged, ...defaults } };
        });

        return acc;
      }, {});

      const currentOrderDetail = planMeta.orderDetail || {};
      const normalizedCurrentOrderDetail = Object.keys(
        currentOrderDetail,
      ).reduce((acc, time) => {
        const entry = currentOrderDetail[time] || {};
        acc[time] = { memberOrders: entry.memberOrders || {} };

        return acc;
      }, {});

      const compareResult = deepEqual(
        expectedOrderDetail,
        normalizedCurrentOrderDetail,
      );

      if (!compareResult.equal) {
        const content = `:warning: *Order log mismatch detected*\n*Order ID:* ${orderId}\n*Plan ID:* ${planId}\n*Differences:*\n\`\`\`${JSON.stringify(
          compareResult.differences,
          null,
          2,
        )}\`\`\``;
        if (config.slack.enabled) {
          await axios.post(config.slack.webhookUrl, {
            text: content,
          });
        }
      }

      return {
        status: 'ok',
        orderId,
        planId,
        isEqual: compareResult.equal,
        differences: compareResult.differences,
      };
    } catch (error) {
      console.error(
        'checkLogOrderDiff failed for order',
        orderId,
        String(error),
      );

      return {
        status: 'error',
        orderId,
        message: String(error),
      };
    }
  };

  // Run with limited concurrency to be friendly to the SDK.
  const concurrency = Number(event.concurrency) || 5;
  const chunks = [];
  for (let i = 0; i < orderIds.length; i += concurrency) {
    chunks.push(orderIds.slice(i, i + concurrency));
  }

  const results = [];
  for (let i = 0; i < chunks.length; i += 1) {
    const chunk = chunks[i];
    const promises = chunk.map((id) => processOrder(id));
    // eslint-disable-next-line no-await-in-loop
    const res = await Promise.all(promises);
    results.push(...res);
  }

  return { status: 'ok', results };
};
