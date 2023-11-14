const uniq = require('lodash/uniq');
const isEmpty = require('lodash/isEmpty');
const DateTime = require('luxon');
const { TRANSITIONS } = require('../../utils/enums');

const convertHHmmStringToTimeParts = (timeStr = '6:30') => {
  const [hours, minutes] = timeStr.split(':') || ['6', '30'];

  return { hours: parseInt(hours, 10), minutes: parseInt(minutes, 10) };
};

const isJoinedPlan = (foodId, status) => {
  return foodId !== '' && status === 'joined';
};

const normalizeOrderDetail = ({
  orderId,
  planId,
  planOrderDetail,
  deliveryHour = '06:30 - 06:45',
  isGroupOrder = true,
}) => {
  return Object.entries(planOrderDetail).reduce((prev, [date, orderOfDate]) => {
    const {
      restaurant: { id: restaurantId, foodList = {} },
      memberOrders: memberOrdersMap,
      lineItems = [],
      transactionId,
      lastTransition,
    } = orderOfDate;

    if (lastTransition) {
      return prev;
    }

    const startDate = DateTime.fromMillis(Number(date));
    const bookingStart = startDate.toJSDate();
    const bookingEnd = startDate.plus({ days: 1 }).toJSDate();
    const bookingDisplayStart = startDate
      .plus({
        ...convertHHmmStringToTimeParts(deliveryHour.split(' - ')[0]),
      })
      .toJSDate();
    const bookingDisplayEnd = bookingEnd;

    if (isGroupOrder) {
      const { participantIds, bookingInfo } = Object.entries(
        memberOrdersMap,
      ).reduce(
        (prevResult, [participantId, { foodId, status, requirement }]) => {
          const {
            participantIds: prevParticipantList = [],
            bookingInfo: prevBookingInfo = [],
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
              bookingDisplayEnd,
              transactionId,
            },
            date,
          });
    }

    const extendedData = {
      metadata: {
        lineItems,
        orderId,
        planId,
      },
    };

    return isEmpty(lineItems)
      ? prev
      : prev.concat({
          params: {
            listingId: restaurantId,
            extendedData,
            bookingStart,
            bookingEnd,
            bookingDisplayStart,
            bookingDisplayEnd,
            transactionId,
          },
          date,
        });
  }, []);
};

const prepareNewPlanOrderDetail = (planOrderDetail, transactionIdMap) => {
  if (isEmpty(transactionIdMap)) {
    return planOrderDetail;
  }

  return Object.entries(planOrderDetail).reduce((prev, [date, orderOfDate]) => {
    return {
      ...prev,
      [date]: {
        ...orderOfDate,
        transactionId: transactionIdMap[date],
        lastTransition: TRANSITIONS.INITIATE_TRANSACTION,
      },
    };
  }, {});
};

const getPickFoodParticipants = (orderDetail) => {
  const shouldSendNativeNotificationParticipantIdList =
    Object.entries(orderDetail).reduce >
    ((acc, [, subOrder]) => {
      const { memberOrders = {} } = subOrder;
      const memberHasPickFood = Object.keys(memberOrders).filter((memberId) => {
        return memberOrders[memberId].foodId;
      });

      return uniq([...acc, ...memberHasPickFood]);
    },
    []);

  return shouldSendNativeNotificationParticipantIdList;
};

module.exports = {
  prepareNewPlanOrderDetail,
  getPickFoodParticipants,
  normalizeOrderDetail,
};
