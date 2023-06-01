import {
  getFoodDataMap,
  getPCCFeeByMemberAmount,
  getTotalInfo,
} from '@helpers/orderHelper';
import config from '@src/configs';
import {
  EOrderStates,
  EParticipantOrderStatus,
  ESubOrderStatus,
} from '@src/utils/enums';
import { Listing } from '@utils/data';
import type { TListing, TObject, TQuotation } from '@utils/types';

export const calculateTotalPriceAndDishes = ({
  orderDetail = {},
}: {
  orderDetail: TObject;
}) => {
  return Object.entries<TObject>(orderDetail).reduce<TObject>(
    (result, currentOrderDetailEntry) => {
      const [, rawOrderDetailOfDate] = currentOrderDetailEntry;
      const { memberOrders, restaurant = {}, status } = rawOrderDetailOfDate;
      const { foodList: foodListOfDate } = restaurant;
      if (status === ESubOrderStatus.CANCELED) {
        return result;
      }

      const foodDataMap = getFoodDataMap({ foodListOfDate, memberOrders });
      const foodDataList = Object.values(foodDataMap);
      const totalInfo = getTotalInfo(foodDataList);

      return {
        ...result,
        totalPrice: result.totalPrice + totalInfo.totalPrice,
        totalDishes: result.totalDishes + totalInfo.totalDishes,
      };
    },
    {
      totalDishes: 0,
      totalPrice: 0,
    },
  );
};

export const calculatePriceQuotationInfo = ({
  planOrderDetail = {},
  order,
}: {
  planOrderDetail: TObject;
  order: TObject;
}) => {
  const { packagePerMember = 0, orderState } = Listing(
    order as TListing,
  ).getMetadata();
  const isOrderInProgress = orderState === EOrderStates.inProgress;

  const currentOrderDetail = Object.entries<TObject>(
    planOrderDetail,
  ).reduce<TObject>((result, currentOrderDetailEntry) => {
    const [subOrderDate, rawOrderDetailOfDate] = currentOrderDetailEntry;
    const { status, transactionId } = rawOrderDetailOfDate;
    if (
      status === ESubOrderStatus.CANCELED ||
      (!transactionId && isOrderInProgress)
    ) {
      return result;
    }

    return {
      ...result,
      [subOrderDate]: {
        ...rawOrderDetailOfDate,
      },
    };
  }, {});
  const actualPCCFee = Object.values(currentOrderDetail).reduce(
    (result, currentOrderDetailOfDate) => {
      const { memberOrders } = currentOrderDetailOfDate;
      const memberAmountOfDate = Object.values(memberOrders).reduce(
        (resultOfDate: number, currentMemberOrder: any) => {
          const { foodId, status: memberStatus } = currentMemberOrder;
          if (foodId && memberStatus === EParticipantOrderStatus.joined) {
            return resultOfDate + 1;
          }

          return resultOfDate;
        },
        0,
      );

      return result + getPCCFeeByMemberAmount(memberAmountOfDate);
    },
    0,
  );

  const { totalPrice = 0, totalDishes = 0 } = calculateTotalPriceAndDishes({
    orderDetail: planOrderDetail,
  });

  const PITOPoints = Math.floor(totalPrice / 100000);
  const isOverflowPackage = totalDishes * packagePerMember < totalPrice;
  const serviceFee = 0;
  const transportFee = 0;
  const promotion = 0;

  const PITOFee = actualPCCFee;

  const totalWithoutVAT =
    totalPrice + serviceFee + transportFee + PITOFee - promotion;
  const VATFee = Math.round(totalWithoutVAT * config.VATPercentage);
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
    serviceFee,
    transportFee,
    promotion,
    overflow,
    isOverflowPackage,
    totalWithoutVAT,
    PITOFee,
  };
};

export const calculatePriceQuotationPartner = ({
  quotation,
  serviceFee = 0,
}: {
  quotation: TQuotation;
  serviceFee: number;
}) => {
  const promotion = 0;
  const totalPrice = Object.keys(quotation).reduce(
    (result: number, orderDate: string) => {
      const totalPriceInDate = quotation[orderDate].reduce(
        (singleDateSum: number, item: any) => {
          return singleDateSum + item.foodPrice * item.frequency;
        },
        0,
      );

      return result + totalPriceInDate;
    },
    0,
  );
  const serviceFeePrice = Math.round((totalPrice * serviceFee) / 100);
  const totalWithoutVAT = totalPrice - promotion - serviceFeePrice;
  const VATFee = Math.round(totalWithoutVAT * config.VATPercentage);
  const totalWithVAT = VATFee + totalWithoutVAT;

  return {
    totalPrice,
    VATFee,
    serviceFee,
    serviceFeePrice,
    totalWithoutVAT,
    totalWithVAT,
    promotion,
  };
};
