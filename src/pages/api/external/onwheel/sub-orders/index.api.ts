import { uniq } from 'lodash';
import isEmpty from 'lodash/isEmpty';
import { DateTime } from 'luxon';
import type { NextApiRequest, NextApiResponse } from 'next';

import {
  fetchListingsByChunkedIds,
  fetchUserByChunkedIds,
  queryAllTransactions,
} from '@helpers/apiHelpers';
import { convertHHmmStringToTimeParts } from '@helpers/dateHelpers';
import { calculateTotalPriceAndDishes } from '@helpers/order/cartInfoHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import externalOnWheelChecker from '@services/permissionChecker/external/onwheel';
import { handleError } from '@services/sdk';
import {
  denormalisedResponseEntities,
  Listing,
  Transaction,
  User,
} from '@src/utils/data';
import { VNTimezone } from '@src/utils/dates';
import { buildFullName } from '@src/utils/emailTemplate/participantOrderPicking';
import { EOrderType } from '@src/utils/enums';
import { ETransition } from '@src/utils/transaction';
import type { TTransaction } from '@src/utils/types';

const { NEXT_PUBLIC_ENV, NEXT_PUBLIC_CANONICAL_URL } = process.env;

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { startDeliveryTime, endDeliveryTime } = req.query;
    const integrationSdk = getIntegrationSdk();

    const demandStartDeliveryTime =
      NEXT_PUBLIC_ENV === 'development'
        ? DateTime.fromISO(startDeliveryTime as string)
            .setZone(VNTimezone)
            .toMillis()
        : DateTime.fromISO(startDeliveryTime as string)
            .setZone(VNTimezone)
            .minus({ hours: 7 })
            .toMillis();

    const demandEndDeliveryTime =
      NEXT_PUBLIC_ENV === 'development'
        ? DateTime.fromISO(endDeliveryTime as string)
            .setZone(VNTimezone)
            .toMillis()
        : DateTime.fromISO(endDeliveryTime as string)
            .setZone(VNTimezone)
            .minus({ hours: 7 })
            .toMillis();
    console.log('demandStartDeliveryTime', demandStartDeliveryTime);
    console.log('demandEndDeliveryTime', demandEndDeliveryTime);
    let txs = [];
    if (NEXT_PUBLIC_ENV === 'production') {
      txs = await queryAllTransactions({
        query: {
          lastTransition: ETransition.PARTNER_CONFIRM_SUB_ORDER,
          include: ['provider'],
        },
      });
    } else {
      const hasTimeParams = startDeliveryTime || endDeliveryTime;
      txs = denormalisedResponseEntities(
        await integrationSdk.transactions.query({
          lastTransition: ETransition.PARTNER_CONFIRM_SUB_ORDER,
          include: ['provider'],
        }),
      ).slice(0, hasTimeParams ? undefined : 20);
    }
    const { orderIdList, planIdList, restaurantIdList } = txs.reduce(
      (acc: any, tx: TTransaction) => {
        const txGetter = Transaction(tx);
        const { provider } = tx;
        const { orderId, planId } = txGetter.getMetadata();
        const providerUser = User(provider);
        const { restaurantListingId } = providerUser.getMetadata();

        acc.orderIdList.push(orderId);
        acc.planIdList.push(planId);
        acc.restaurantIdList.push(restaurantListingId);

        return acc;
      },
      {
        orderIdList: [],
        planIdList: [],
        restaurantIdList: [],
      },
    );
    const uniqOrderIdList = uniq<string>(orderIdList);
    const uniqPlanIdList = uniq<string>(planIdList);
    const orders = await fetchListingsByChunkedIds(
      uniqOrderIdList,
      integrationSdk,
    );

    const ordersObjWithOrderIdKey = orders.reduce((acc: any, order: any) => {
      acc[order.id.uuid] = order;

      return acc;
    }, {});

    const plans = await fetchListingsByChunkedIds(
      uniqPlanIdList,
      integrationSdk,
    );

    const plansObjWithPlanIdKey = plans.reduce((acc: any, plan: any) => {
      acc[plan.id.uuid] = plan;

      return acc;
    }, {});

    const restaurants = await fetchListingsByChunkedIds(
      restaurantIdList,
      integrationSdk,
    );

    const restaurantsObjWithRestaurantIdKey = restaurants.reduce(
      (acc: any, restaurant: any) => {
        acc[restaurant.id.uuid] = restaurant;

        return acc;
      },
      {},
    );

    const { companyIdList, bookerIdList } = orders.reduce(
      (acc: any, order: any) => {
        const orderListing = Listing(order);
        const { bookerId, companyId } = orderListing.getMetadata();

        acc.companyIdList.push(companyId);
        acc.bookerIdList.push(bookerId);

        return acc;
      },
      {
        companyIdList: [],
        bookerIdList: [],
      },
    );

    const uniqCompanyIdList = uniq<string>(companyIdList);
    const uniqBookerIdList = uniq<string>(bookerIdList);

    const companies = await fetchUserByChunkedIds(
      uniqCompanyIdList,
      integrationSdk,
    );

    const companiesObjWithCompanyIdKey = companies.reduce(
      (acc: any, company: any) => {
        acc[company.id.uuid] = company;

        return acc;
      },
      {},
    );

    const bookers = await fetchUserByChunkedIds(
      uniqBookerIdList,
      integrationSdk,
    );

    const bookersObjWithBookerIdKey = bookers.reduce(
      (acc: any, booker: any) => {
        acc[booker.id.uuid] = booker;

        return acc;
      },
      {},
    );
    const subOrders = txs.reduce((acc: any, tx: TTransaction) => {
      const txGetter = Transaction(tx);
      const { orderId, planId, timestamp } = txGetter.getMetadata();
      const { lastTransition } = txGetter.getAttributes();

      if (lastTransition !== ETransition.PARTNER_CONFIRM_SUB_ORDER) {
        return acc;
      }

      if (
        timestamp < demandStartDeliveryTime ||
        timestamp > demandEndDeliveryTime ||
        !timestamp
      ) {
        return acc;
      }

      const order = ordersObjWithOrderIdKey[orderId];
      const plan = plansObjWithPlanIdKey[planId];
      const orderListing = Listing(order);
      const planListing = Listing(plan);
      const { orderDetail = {} } = planListing.getMetadata();
      const subOrder = orderDetail[timestamp];
      const { restaurant = {}, isOnWheelOrderCreated = false } = subOrder || {};

      if (isOnWheelOrderCreated) {
        return acc;
      }

      const { title: orderTitle } = orderListing.getAttributes();
      const {
        deliveryDate,
        deliveryHour,
        companyId,
        bookerId,
        orderType = EOrderType.group,
      } = orderListing.getMetadata();

      if (!deliveryHour || !orderTitle) {
        return acc;
      }

      const {
        restaurantName,
        phoneNumber: restaurantPhoneNumber,
        id,
      } = restaurant;
      const restaurantListing = restaurantsObjWithRestaurantIdKey[id];
      const restaurantListingGetter = Listing(restaurantListing);
      const { location: restaurantLocation } =
        restaurantListingGetter.getPublicData();

      const { address: restaurantAddress } = restaurantLocation || {};

      const { weekday } = DateTime.fromMillis(Number(timestamp)).setZone(
        VNTimezone,
      );
      const subOrderTitle = `${orderTitle}-${weekday}`;

      const company = companiesObjWithCompanyIdKey[companyId];
      const booker = bookersObjWithBookerIdKey[bookerId];

      const companyUser = User(company);
      const bookerUser = User(booker);

      const { companyLocation } = companyUser.getPublicData();
      const { address: companyAddress } = companyLocation || {};

      const { firstName, lastName, displayName } = bookerUser.getProfile();
      const { phoneNumber: bookerPhoneNumber } = bookerUser.getPublicData();
      const bookerName = buildFullName(firstName, lastName, {
        compareToGetLongerWith: displayName,
      }).trim();

      const isGroupOrder = orderType === EOrderType.group;

      const { totalDishes } = calculateTotalPriceAndDishes({
        orderDetail: {
          [timestamp]: subOrder,
        },
        isGroupOrder,
      });

      return [
        ...acc,
        {
          trackingNumber: subOrderTitle,
          deliveryDate,
          deliveryHour: DateTime.fromMillis(Number(timestamp))
            .setZone(VNTimezone)
            .plus({
              ...convertHHmmStringToTimeParts(
                isEmpty(deliveryHour)
                  ? undefined
                  : deliveryHour.includes('-')
                  ? deliveryHour.split('-')[0]
                  : deliveryHour,
              ),
            })
            .toUnixInteger(),
          subOrderTitle,
          trackingUrl: `${NEXT_PUBLIC_CANONICAL_URL}/tracking/${orderId}_${timestamp}${
            process.env.NEXT_PUBLIC_DELIVERY_INFO_ENABLED === 'true'
              ? `?delivery=true`
              : ''
          }`,
          restaurantName,
          restaurantPhoneNumber,
          restaurantAddress,
          bookerName,
          bookerPhoneNumber,
          companyAddress,
          totalDishes,
        },
      ];
    }, []);
    res.json(subOrders);
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default externalOnWheelChecker(handler);
