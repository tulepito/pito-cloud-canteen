import { isEmpty } from 'lodash';
import { DateTime } from 'luxon';

import { convertHHmmStringToTimeParts } from '@helpers/dateHelpers';
import { isJoinedPlan } from '@helpers/orderHelper';
import type { TPlan } from '@src/utils/orderTypes';
import type { TObject } from '@src/utils/types';

type TPlanOrderDetail = TPlan['orderDetail'];
type TOrderOfDate = TPlanOrderDetail[keyof TPlanOrderDetail];

type TNormalizedOrderDetail = {
  params: {
    transactionId: string;
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
    bookingDisplayEnd: Date;
  };

  date: string;
};

export const normalizeOrderDetail = ({
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
        transactionId,
      } = orderOfDate;
      const startDate = DateTime.fromMillis(Number(date));
      const bookingStart = startDate.toJSDate();
      const bookingEnd = startDate.plus({ days: 1 }).toJSDate();
      const bookingDisplayStart = startDate
        .plus({
          ...convertHHmmStringToTimeParts(deliveryHour),
        })
        .toJSDate();
      const bookingDisplayEnd = bookingEnd;

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
              listingId: restaurantId as string,
              extendedData,
              bookingStart,
              bookingEnd,
              bookingDisplayStart,
              bookingDisplayEnd,
              transactionId: transactionId as string,
            },
            date,
          });
    },
    [],
  );
};

export const prepareNewPlanOrderDetail = (
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
