import isEmpty from 'lodash/isEmpty';
import pick from 'lodash/pick';

import {
  getFoodDataMap,
  getPCCFeeByMemberAmount,
  getTotalInfo,
  isJoinedPlan,
} from '@helpers/orderHelper';
import {
  EOrderStates,
  EOrderType,
  EPartnerVATSetting,
  ESubOrderStatus,
} from '@src/utils/enums';
import { ETransition } from '@src/utils/transaction';
import { Listing } from '@utils/data';
import type { TListing, TObject, TQuotation } from '@utils/types';

export const vatPercentageBaseOnVatSetting = ({
  vatSetting,
  vatPercentage,
}: {
  vatSetting: EPartnerVATSetting;
  vatPercentage: number;
}) => {
  switch (vatSetting) {
    case EPartnerVATSetting.direct:
      return 0;
    case EPartnerVATSetting.noExportVat:
      return -0.04;
    case EPartnerVATSetting.vat:
    default:
      return vatPercentage;
  }
};

export const calculateTotalPriceAndDishes = ({
  orderDetail = {},
  isGroupOrder,
  date,
}: {
  orderDetail: TObject;
  isGroupOrder: boolean;
  date?: number | string;
}) => {
  return isGroupOrder
    ? Object.entries<TObject>(orderDetail).reduce<TObject>(
        (result, currentOrderDetailEntry) => {
          const [dateKey, rawOrderDetailOfDate] = currentOrderDetailEntry;
          if (date && date?.toString() !== dateKey) {
            return result;
          }

          const {
            memberOrders,
            restaurant = {},
            status,
            lastTransition,
          } = rawOrderDetailOfDate;
          const { foodList: foodListOfDate } = restaurant;
          if (
            status === ESubOrderStatus.canceled ||
            lastTransition === ETransition.OPERATOR_CANCEL_PLAN
          ) {
            return result;
          }

          const foodDataMap = getFoodDataMap({ foodListOfDate, memberOrders });
          const foodDataList = Object.values(foodDataMap);
          const totalInfo = getTotalInfo(foodDataList);

          return {
            ...result,
            totalPrice: result.totalPrice + totalInfo.totalPrice,
            totalDishes: result.totalDishes + totalInfo.totalDishes,
            [dateKey]: foodDataList,
          };
        },
        {
          totalDishes: 0,
          totalPrice: 0,
        },
      )
    : Object.entries<TObject>(orderDetail).reduce<TObject>(
        (result, currentOrderDetailEntry) => {
          const [dateKey, rawOrderDetailOfDate] = currentOrderDetailEntry;
          const {
            lineItems = [],
            status,
            lastTransition,
          } = rawOrderDetailOfDate;

          if (
            (date && date?.toString() !== dateKey) ||
            status === ESubOrderStatus.canceled ||
            lastTransition === ETransition.OPERATOR_CANCEL_PLAN
          ) {
            return result;
          }
          const totalInfo = lineItems.reduce(
            (
              res: {
                totalPrice: number;
                totalDishes: number;
              },
              item: TObject,
            ) => {
              const { quantity = 1, price = 0 } = item || {};

              return {
                totalPrice: res.totalPrice + price,
                totalDishes: res.totalDishes + quantity,
              };
            },
            { totalPrice: 0, totalDishes: 0 },
          );
          const foodDataList = lineItems.map((item: TObject) => {
            return {
              foodName: item?.name,
              frequency: item?.quantity,
            };
          });

          return {
            ...result,
            totalPrice: result.totalPrice + totalInfo.totalPrice,
            totalDishes: result.totalDishes + totalInfo.totalDishes,
            [dateKey]: foodDataList,
          };
        },
        {
          totalDishes: 0,
          totalPrice: 0,
        },
      );
};

export const calculatePCCFeeByDate = ({
  isGroupOrder,
  memberOrders,
  lineItems,
  hasSpecificPCCFee,
  specificPCCFee,
}: {
  isGroupOrder: boolean;
  memberOrders: TObject;
  lineItems: TObject[];
  hasSpecificPCCFee?: boolean;
  specificPCCFee: number;
}) => {
  const memberAmountOfDate = isGroupOrder
    ? Object.values(memberOrders).reduce(
        (resultOfDate: number, currentMemberOrder: any) => {
          const { foodId, status } = currentMemberOrder;

          return isJoinedPlan(foodId, status) ? resultOfDate + 1 : resultOfDate;
        },
        0,
      )
    : lineItems.reduce((res: number, item: TObject) => {
        return res + (item?.quantity || 1);
      }, 0);

  const PCCFeeOfDate = hasSpecificPCCFee
    ? memberAmountOfDate > 0
      ? specificPCCFee
      : 0
    : getPCCFeeByMemberAmount(memberAmountOfDate);

  return PCCFeeOfDate;
};

export const calculatePriceQuotationInfo = ({
  planOrderDetail = {},
  order,
  currentOrderVATPercentage,
  currentOrderServiceFeePercentage = 0,
  date,
  shouldIncludePITOFee = true,
  hasSpecificPCCFee = false,
  specificPCCFee = 0,
}: {
  planOrderDetail: TObject;
  order: TObject;
  currentOrderVATPercentage: number;
  date?: number | string;
  shouldIncludePITOFee?: boolean;
  currentOrderServiceFeePercentage?: number;
  hasSpecificPCCFee?: boolean;
  specificPCCFee?: number;
}) => {
  const {
    packagePerMember = 0,
    orderState,
    orderType = EOrderType.group,
  } = Listing(order as TListing).getMetadata();
  const isOrderInProgress = orderState === EOrderStates.inProgress;
  const isGroupOrder = orderType === EOrderType.group;

  const currentOrderDetail = Object.entries<TObject>(
    planOrderDetail,
  ).reduce<TObject>((result, currentOrderDetailEntry) => {
    const [subOrderDate, rawOrderDetailOfDate] = currentOrderDetailEntry;
    const { status, transactionId, lastTransition } = rawOrderDetailOfDate;

    if (
      status === ESubOrderStatus.canceled ||
      lastTransition === ETransition.OPERATOR_CANCEL_PLAN ||
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

  const PCCFee = Object.values(currentOrderDetail).reduce(
    (result, currentOrderDetailOfDate) => {
      const { memberOrders, lineItems = [] } = currentOrderDetailOfDate;
      const PCCFeeOfDate = calculatePCCFeeByDate({
        isGroupOrder,
        memberOrders,
        lineItems,
        hasSpecificPCCFee,
        specificPCCFee,
      });

      return result + PCCFeeOfDate;
    },
    0,
  );
  const actualPCCFee = shouldIncludePITOFee ? PCCFee : 0;
  const { totalPrice = 0, totalDishes = 0 } = calculateTotalPriceAndDishes({
    orderDetail: planOrderDetail,
    isGroupOrder,
    date,
  });

  const PITOPoints = Math.floor(totalPrice / 100000);
  const isOverflowPackage = totalDishes * packagePerMember < totalPrice;
  const serviceFee = date
    ? Math.round(totalPrice * currentOrderServiceFeePercentage)
    : 0;
  const transportFee = 0;
  const promotion = 0;

  const PITOFee = actualPCCFee;

  const totalWithoutVAT =
    totalPrice - serviceFee + transportFee + PITOFee - promotion;
  const VATFee = Math.round(totalWithoutVAT * currentOrderVATPercentage);
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
  quotation = {},
  serviceFeePercentage = 0,
  currentOrderVATPercentage,
  subOrderDate,
  shouldSkipVAT = false,
}: {
  quotation: TQuotation;
  serviceFeePercentage: number;
  currentOrderVATPercentage: number;
  subOrderDate?: string;
  shouldSkipVAT?: boolean;
}) => {
  const promotion = 0;
  const totalPrice = subOrderDate
    ? quotation[subOrderDate]?.reduce((singleDateSum: number, item: any) => {
        return singleDateSum + item.foodPrice * item.frequency;
      }, 0)
    : Object.keys(quotation).reduce((result: number, orderDate: string) => {
        const totalPriceInDate = quotation[orderDate]?.reduce(
          (singleDateSum: number, item: any) => {
            return singleDateSum + item.foodPrice * item.frequency;
          },
          0,
        );

        return result + totalPriceInDate;
      }, 0);
  const serviceFee = Math.round((totalPrice * serviceFeePercentage) / 100);
  const totalWithoutVAT = totalPrice - promotion - serviceFee;
  const VATFee = shouldSkipVAT
    ? 0
    : Math.round(totalWithoutVAT * currentOrderVATPercentage);
  const totalWithVAT = VATFee + totalWithoutVAT;

  return {
    totalPrice,
    VATFee,
    serviceFee,
    totalWithoutVAT,
    totalWithVAT,
    promotion,
    VATPercentage: currentOrderVATPercentage,
  };
};

export const calculatePriceQuotationInfoFromQuotation = ({
  quotation,
  packagePerMember,
  currentOrderVATPercentage,
  currentOrderServiceFeePercentage = 0,
  date,
  partnerId,
  shouldSkipVAT = false,
  hasSpecificPCCFee,
  specificPCCFee = 0,
}: {
  quotation: TListing;
  packagePerMember: number;
  currentOrderVATPercentage: number;
  currentOrderServiceFeePercentage?: number;
  date?: number | string;
  partnerId?: string;
  shouldSkipVAT?: boolean;
  hasSpecificPCCFee: boolean;
  specificPCCFee?: number;
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
  }: any = Object.values(
    isPartnerFlow ? partnerQuotation : clientQuotation,
  ).reduce(
    (result: any, subOrder: any) => {
      const { subOrderTotalPrice, subOrderTotalDished } = subOrder.reduce(
        (subOrderResult: any, item: any) => {
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
