import { isJoinedPlan } from '@helpers/orderHelper';
import config from '@src/configs';
import { Listing } from '@utils/data';
import type { TListing, TObject } from '@utils/types';

type TFoodDataValue = {
  foodId: string;
  foodName: string;
  foodPrice: number;
  frequency: number;
};

type TFoodDataMap = TObject<string, TFoodDataValue>;

const getFoodDataMap = ({ foodListOfDate = {}, memberOrders }: any) => {
  return Object.entries(memberOrders).reduce<TFoodDataMap>(
    (foodFrequencyResult, currentMemberOrderEntry) => {
      const [, memberOrderData] = currentMemberOrderEntry;
      const { foodId, status } = memberOrderData as TObject;
      const { foodName, foodPrice } = foodListOfDate[foodId] || {};

      if (isJoinedPlan(foodId, status)) {
        const data = foodFrequencyResult[foodId] as TObject;
        const { frequency } = data || {};

        return {
          ...foodFrequencyResult,
          [foodId]: data
            ? { ...data, frequency: frequency + 1 }
            : { foodId, foodName, foodPrice, frequency: 1 },
        };
      }

      return foodFrequencyResult;
    },
    {},
  );
};

const getTotalInfo = (foodDataList: TFoodDataValue[]) => {
  return foodDataList.reduce<{
    totalPrice: number;
    totalDishes: number;
  }>(
    (previousResult, current: TObject) => {
      const { totalPrice, totalDishes } = previousResult;
      const { frequency, foodPrice } = current;

      return {
        ...previousResult,
        totalDishes: totalDishes + frequency,
        totalPrice: totalPrice + foodPrice * frequency,
      };
    },
    {
      totalDishes: 0,
      totalPrice: 0,
    },
  );
};

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
