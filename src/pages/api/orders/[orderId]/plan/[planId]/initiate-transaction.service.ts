import { convertHHmmStringToTimeParts } from '@helpers/dateHelpers';
import { isJoinedPlan } from '@helpers/orderHelper';
import { denormalisedResponseEntities } from '@services/data';
import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/sdk';
import { getSubAccountTrustedSdk } from '@services/subAccountSdk';
import config from '@src/configs';
import { Listing } from '@utils/data';
import type { TPlan } from '@utils/orderTypes';
import { ETransition } from '@utils/transaction';
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
    bookingStart: number;
    bookingEnd: number;
  };

  shouldCancel?: boolean;
};

const normalizeOrderDetail = ({
  planOrderDetail,
  deliveryHour = '6:30',
}: {
  planOrderDetail: TPlanOrderDetail;
  deliveryHour: string;
}) => {
  return Object.entries(planOrderDetail).reduce<TNormalizedOrderDetail[]>(
    (
      prev,
      [date, orderOfDate]: [string, TOrderOfDate],
      currIndex,
      allItems,
    ) => {
      const {
        restaurant: { id: restaurantId, foodList = {} },
        memberOrders: memberOrdersMap,
      } = orderOfDate;
      const startDate = DateTime.fromMillis(Number(date));
      const bookingStart = startDate
        .plus({ ...convertHHmmStringToTimeParts(deliveryHour) })
        .toMillis();
      const bookingEnd = startDate.plus({ days: 1 }).toMillis();

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
          isLastTxOfPlan: currIndex === allItems.length - 1,
        },
      };

      return prev.concat({
        params: {
          listingId: restaurantId,
          extendedData,
          bookingStart,
          bookingEnd,
        },
        shouldCancel: isEmpty(participantIds),
      });
    },
    [],
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

  const {
    companyId,
    deliveryHour,
    plans = [],
  } = Listing(orderListing).getMetadata();

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
    planOrderDetail,
    deliveryHour,
  });

  // Initiate transaction for each date
  await Promise.all(
    normalizedOrderDetail.map(async (item) => {
      const {
        params: { listingId, bookingStart, bookingEnd, extendedData },
        shouldCancel,
      } = item;

      if (shouldCancel) {
        return;
      }

      await subAccountTrustedSdk.transactions.initiate({
        processAlias: config.bookingProcessAlias,
        transition: ETransition.INITIATE_TRANSACTION,
        params: {
          listingId,
          bookingStart,
          bookingEnd,
          ...extendedData,
        },
      });
    }),
  );
};
