import { convertHHmmStringToTimeParts } from '@helpers/dateHelpers';
import { isJoinedPlan } from '@helpers/orderHelper';
import { denormalisedResponseEntities } from '@services/data';
import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/sdk';
import { getSubAccountTrustedSdk } from '@services/subAccountSdk';
import config from '@src/configs';
import { Listing, Transaction } from '@utils/data';
import type { TPlan } from '@utils/orderTypes';
import { ETransition } from '@utils/transaction';
import type { TObject } from '@utils/types';
import isEmpty from 'lodash/isEmpty';
import { DateTime } from 'luxon';

type TPlanOrderDetail = TPlan['orderDetail'];
type TOrderOfDate = TPlanOrderDetail[keyof TPlanOrderDetail];

type TNormalizedOrderDetail = {
  params: {
    listingId: string;
    extendedData: {
      metadata: {
        participantIds: string[];
        bookingInfo: {
          foodId: string;
          foodName: string;
          foodPrice: number;
          requirement?: string;
          participantId: string;
        }[];
      };
    };
    bookingStart: Date;
    bookingEnd: Date;
    bookingDisplayStart: Date;
  };

  date: string;
};

const normalizeOrderDetail = ({
  orderId,
  planId,
  planOrderDetail,
  deliveryHour = '6:30',
}: {
  orderId: string;
  planId: string;
  planOrderDetail: TPlanOrderDetail;
  deliveryHour: string;
}) => {
  return Object.entries(planOrderDetail).reduce<TNormalizedOrderDetail[]>(
    (prev, [date, orderOfDate]: [string, TOrderOfDate]) => {
      const {
        restaurant: { id: restaurantId, foodList = {} },
        memberOrders: memberOrdersMap,
      } = orderOfDate;
      const startDate = DateTime.fromMillis(Number(date));
      const bookingStart = startDate.toJSDate();
      const bookingEnd = startDate.plus({ days: 1 }).toJSDate();
      const bookingDisplayStart = startDate
        .plus({
          ...convertHHmmStringToTimeParts(deliveryHour),
        })
        .toJSDate();

      const { participantIds, bookingInfo } = Object.entries(
        memberOrdersMap,
      ).reduce<TNormalizedOrderDetail['params']['extendedData']['metadata']>(
        (prevResult, [participantId, { foodId, status, requirement }]) => {
          const {
            participantIds: prevParticipantList,
            bookingInfo: prevBookingInfo,
          } = prevResult;
          const currFoodInfo = foodList[foodId];

          if (currFoodInfo && isJoinedPlan(foodId, status)) {
            return {
              ...prevResult,
              participantIds: prevParticipantList.concat(participantId),
              bookingInfo: prevBookingInfo.concat({
                foodId,
                ...currFoodInfo,
                participantId,
                requirement,
              }),
            };
          }

          return prevResult;
        },
        { participantIds: [], bookingInfo: [] },
      );

      const extendedData = {
        metadata: {
          participantIds,
          bookingInfo,
          orderId,
          planId,
        },
      };

      return isEmpty(participantIds)
        ? prev
        : prev.concat({
            params: {
              listingId: restaurantId,
              extendedData,
              bookingStart,
              bookingEnd,
              bookingDisplayStart,
            },
            date,
          });
    },
    [],
  );
};

const prepareNewPlanOrderDetail = (
  planOrderDetail: TPlanOrderDetail,
  transactionIdMap: TObject,
) => {
  if (isEmpty(transactionIdMap)) {
    return planOrderDetail;
  }

  return Object.entries(planOrderDetail).reduce<TPlanOrderDetail>(
    (prev, [date, orderOfDate]: [string, TOrderOfDate]) => {
      return {
        ...prev,
        [date]: { ...orderOfDate, transactionId: transactionIdMap[date] },
      };
    },
    {},
  );
};

export const initiateTransaction = async ({
  orderId,
  planId,
}: {
  orderId: string;
  planId: string;
}) => {
  // Query order and plan listing
  const integrationSdk = getIntegrationSdk();
  const [orderListing] = denormalisedResponseEntities(
    await integrationSdk.listings.show({
      id: orderId,
    }),
  );
  const [planListing] = denormalisedResponseEntities(
    await integrationSdk.listings.show({
      id: planId,
    }),
  );

  const orderData = Listing(orderListing);
  const { companyId, deliveryHour, plans = [] } = orderData.getMetadata();

  if (plans.length === 0 || !plans.includes(planId)) {
    throw new Error(`Invalid planId, ${planId}`);
  }

  const companyAccount = await fetchUser(companyId);
  const { subAccountId } = companyAccount.attributes.profile.privateData;
  const companySubAccount = await fetchUser(subAccountId);
  const subAccountTrustedSdk = await getSubAccountTrustedSdk(companySubAccount);
  const { orderDetail: planOrderDetail } = Listing(planListing).getMetadata();

  // Normalize order detail
  const normalizedOrderDetail = normalizeOrderDetail({
    orderId,
    planId,
    planOrderDetail,
    deliveryHour,
  });

  const transactionMap: TObject = {};
  // Initiate transaction for each date
  await Promise.all(
    normalizedOrderDetail.map(async (item, index) => {
      const {
        params: {
          listingId,
          bookingStart,
          bookingEnd,
          bookingDisplayStart,
          extendedData: { metadata },
        },
        date,
      } = item;

      const createTxResponse = await subAccountTrustedSdk.transactions.initiate(
        {
          processAlias: config.bookingProcessAlias,
          transition: ETransition.INITIATE_TRANSACTION,
          params: {
            listingId,
            bookingStart,
            bookingEnd,
            bookingDisplayStart,
            bookingDisplayEnd: bookingEnd,
            metadata: {
              ...metadata,
              isLastTxOfPlan: index === normalizedOrderDetail.length - 1,
            },
          },
        },
      );

      const [tx] = denormalisedResponseEntities(createTxResponse);
      const txId = Transaction(tx).getId() as string;

      transactionMap[date] = txId;
      return txId;
    }),
  );

  // Update new order detail of plan listing
  await integrationSdk.listings.update({
    id: planId,
    metadata: {
      orderDetail: prepareNewPlanOrderDetail(planOrderDetail, transactionMap),
    },
  });
};
