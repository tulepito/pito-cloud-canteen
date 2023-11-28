const groupBy = require('lodash/groupBy');

const { createQuotation } = require('./createQuotation');

const initiateQuotation = async (
  orderId,
  companyId,
  foodOrderGroupedByDate,
) => {
  const clientQuotation = {
    quotation: foodOrderGroupedByDate.reduce((result, item) => {
      result[item.date] = item.foodDataList;

      return result;
    }, {}),
  };

  const groupByRestaurantQuotationData = groupBy(
    foodOrderGroupedByDate,
    'restaurantId',
  );

  const partnerQuotation = Object.keys(groupByRestaurantQuotationData).reduce(
    (result, item) => {
      result[item] = {
        name: groupByRestaurantQuotationData[item][0].restaurantName,
        quotation: groupByRestaurantQuotationData[item].reduce(
          (quotationArrayResult, quotationItem) => {
            return {
              ...quotationArrayResult,
              [quotationItem.date]: quotationItem.foodDataList,
            };
          },
          {},
        ),
      };

      return result;
    },
    {},
  );

  return await createQuotation({
    orderId,
    companyId,
    partner: partnerQuotation,
    client: clientQuotation,
  });
};

module.exports = { initiateQuotation };
