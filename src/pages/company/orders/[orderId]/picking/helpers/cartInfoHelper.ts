import { getFoodDataMap, getTotalInfo } from '@helpers/orderHelper';
import config from '@src/configs';
import { Listing } from '@utils/data';
import type { TListing, TObject } from '@utils/types';

export const calculateTotalPriceAndDishes = ({
  orderDetail = {},
}: {
  orderDetail: TObject;
}) => {
  return Object.entries<TObject>(orderDetail).reduce<TObject>(
    (result, currentOrderDetailEntry) => {
      const [, rawOrderDetailOfDate] = currentOrderDetailEntry;
      const { memberOrders, restaurant = {} } = rawOrderDetailOfDate;
      const { foodList: foodListOfDate } = restaurant;

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
  const { packagePerMember = 0 } = Listing(order as TListing).getMetadata();
  const { totalPrice = 0, totalDishes = 0 } = calculateTotalPriceAndDishes({
    orderDetail: planOrderDetail,
  });

  const PITOPoints = Math.floor(totalPrice / 100000);
  const isOverflowPackage = totalDishes * packagePerMember < totalPrice;
  const VATFee = Math.round(totalPrice * config.VATPercentage);
  const serviceFee = 0;
  const transportFee = 0;
  const promotion = 0;
  const totalWithoutVAT = totalPrice + serviceFee + transportFee - promotion;
  const totalWithVAT = /* VATFee + */ totalWithoutVAT;
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
  };
};
