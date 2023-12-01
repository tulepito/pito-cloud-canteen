import type { TObject } from '@src/utils/types';

export const calculateClientQuotation = (foodOrderGroupedByDate: any[]) => {
  return {
    quotation: foodOrderGroupedByDate.reduce((result: any, item: any) => {
      return {
        ...result,
        [item.date]: item.foodDataList,
      };
    }, {}),
  };
};

export const calculatePartnerQuotation = (
  groupByRestaurantQuotationData: TObject,
) => {
  return Object.keys(groupByRestaurantQuotationData).reduce((result, item) => {
    return {
      ...result,
      [item]: {
        name: groupByRestaurantQuotationData[item][0].restaurantName,
        quotation: groupByRestaurantQuotationData[item].reduce(
          (quotationArrayResult: any, quotationItem: any) => {
            return {
              ...quotationArrayResult,
              [quotationItem.date]: quotationItem.foodDataList,
            };
          },
          {},
        ),
      },
    };
  }, {});
};
