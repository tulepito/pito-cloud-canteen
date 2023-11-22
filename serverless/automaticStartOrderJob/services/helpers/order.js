const uniq = require('lodash/uniq');
const isEmpty = require('lodash/isEmpty');
const pick = require('lodash/pick');
const { DateTime } = require('luxon');

const { TRANSITIONS } = require('../../utils/enums');
const { Listing } = require('../../utils/data');

const convertHHmmStringToTimeParts = (timeStr = '6:30') => {
  const [hours, minutes] = timeStr.split(':') || ['6', '30'];

  return { hours: parseInt(hours, 10), minutes: parseInt(minutes, 10) };
};

const isJoinedPlan = (foodId, status) => {
  return foodId !== '' && status === 'joined';
};

const checkIsOrderHasInProgressState = (orderStateHistory) => {
  return orderStateHistory.some((state) => state.state === 'inProgress');
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
      restaurant = {},
      memberOrders: memberOrdersMap,
      lineItems = [],
      transactionId,
      lastTransition,
    } = orderOfDate;

    const { id: restaurantId, foodList = {} } = restaurant;

    if (lastTransition || !restaurantId) {
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

const isEnableToCancelOrder = (orderDetail) => {
  return (
    isEmpty(orderDetail) ||
    Object.values(orderDetail).some((orderDetailOnDate) => {
      const { restaurant = {}, memberOrders = {} } = orderDetailOnDate || {};
      const { foodList, id: restaurantId, minQuantity = 1 } = restaurant;
      console.info('💫 > restaurant: ', restaurant);
      console.info('💫 > minQuantity: ', minQuantity);

      if (isEmpty(foodList) && isEmpty(restaurantId)) {
        return false;
      }

      const pickedFoodCount = Object.values(memberOrders).reduce(
        (total, currentMemberOrder) => {
          if (
            isJoinedPlan(
              currentMemberOrder?.foodId || '',
              currentMemberOrder?.status || 'joined',
            )
          ) {
            return total + 1;
          }

          return total;
        },
        0,
      );
      console.info('💫 > pickedFoodCount: ', pickedFoodCount);

      return pickedFoodCount === 0 || pickedFoodCount < minQuantity;
    })
  );
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
  const shouldSendNativeNotificationParticipantIdList = Object.entries(
    orderDetail,
  ).reduce((acc, [, subOrder]) => {
    const { memberOrders = {} } = subOrder;
    const memberHasPickFood = Object.keys(memberOrders).filter((memberId) => {
      return memberOrders[memberId].foodId;
    });

    return uniq([...acc, ...memberHasPickFood]);
  }, []);

  return shouldSendNativeNotificationParticipantIdList;
};

const getPCCFeeByMemberAmount = (memberAmount) => {
  if (memberAmount === 0) {
    return 0;
  }
  if (memberAmount < 30) {
    return 70000;
  }
  if (memberAmount < 45) {
    return 150000;
  }
  if (memberAmount < 60) {
    return 140000;
  }
  if (memberAmount < 75) {
    return 200000;
  }
  if (memberAmount < 105) {
    return 230000;
  }
  if (memberAmount < 130) {
    return 250000;
  }

  return 500000;
};

const calculatePriceQuotationInfoFromQuotation = ({
  quotation,
  packagePerMember,
  currentOrderVATPercentage,
  currentOrderServiceFeePercentage = 0,
  date,
  partnerId,
  shouldSkipVAT = false,
  hasSpecificPCCFee,
  specificPCCFee = 0,
}) => {
  const quotationListingGetter = Listing(quotation);
  const { client, partner } = quotationListingGetter.getMetadata();
  if (isEmpty(client) || isEmpty(partner)) {
    return {};
  }

  const isPartnerFlow = date && partnerId;

  const clientQuotation = client.quotation;
  const partnerQuotation = isPartnerFlow
    ? pick(partner[partnerId]?.quotation || {}, date)
    : {};

  const {
    totalPrice = 0,
    totalDishes = 0,
    PITOFee = 0,
  } = Object.values(isPartnerFlow ? partnerQuotation : clientQuotation).reduce(
    (result, subOrder) => {
      const { subOrderTotalPrice, subOrderTotalDished } = subOrder.reduce(
        (subOrderResult, item) => {
          const { foodPrice, frequency } = item;

          return {
            subOrderTotalPrice:
              subOrderResult.subOrderTotalPrice + foodPrice * frequency,
            subOrderTotalDished: subOrderResult.subOrderTotalDished + frequency,
          };
        },
        {
          subOrderTotalPrice: 0,
          subOrderTotalDished: 0,
        },
      );

      const PCCFeeOfDate = hasSpecificPCCFee
        ? subOrderTotalDished > 0
          ? specificPCCFee
          : 0
        : getPCCFeeByMemberAmount(subOrderTotalDished);

      return {
        totalPrice: result.totalPrice + subOrderTotalPrice,
        totalDishes: result.totalDishes + subOrderTotalDished,
        PITOFee: isPartnerFlow ? 0 : result.PITOFee + PCCFeeOfDate,
      };
    },
    {
      totalPrice: 0,
      totalDishes: 0,
      PITOFee: 0,
    },
  );

  const PITOPoints = Math.floor(totalPrice / 100000);
  const isOverflowPackage = totalDishes * packagePerMember < totalPrice;
  const serviceFee = isPartnerFlow
    ? Math.round(currentOrderServiceFeePercentage * totalPrice)
    : 0;
  const transportFee = 0;
  const promotion = 0;
  const totalWithoutVAT =
    totalPrice - serviceFee + transportFee + PITOFee - promotion;
  const VATFee = shouldSkipVAT
    ? 0
    : Math.round(totalWithoutVAT * currentOrderVATPercentage || 0);
  const totalWithVAT = VATFee + totalWithoutVAT;
  const overflow = isOverflowPackage
    ? totalWithVAT - totalDishes * packagePerMember
    : 0;

  return {
    totalPrice,
    totalDishes,
    PITOPoints,
    VATFee,
    totalWithVAT,
    serviceFeePercentage: currentOrderServiceFeePercentage * 100,
    serviceFee,
    transportFee,
    promotion,
    overflow,
    isOverflowPackage,
    totalWithoutVAT,
    PITOFee,
    vatPercentage: currentOrderVATPercentage,
  };
};

module.exports = {
  calculatePriceQuotationInfoFromQuotation,
  checkIsOrderHasInProgressState,
  isEnableToCancelOrder,
  prepareNewPlanOrderDetail,
  getPickFoodParticipants,
  normalizeOrderDetail,
};
