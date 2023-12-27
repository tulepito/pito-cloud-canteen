const get = require('lodash/get');

exports.getFoodIdListWithSuitablePrice = (subOrderDate, order, plan) => {
  const packagePerMember = get(
    order,
    'attributes.metadata.packagePerMember',
    0,
  );
  const orderDetail = get(plan, 'attributes.metadata.orderDetail', {});

  const subOrder = orderDetail[subOrderDate];
  const { foodList } = subOrder.restaurant;
  const suitablePriceFoodList = Object.keys(foodList).reduce(
    (result, foodId) => {
      const { foodPrice = 0 } = foodList[foodId] || {};
      if (foodPrice <= packagePerMember) {
        result.push(foodId);
      }

      return result;
    },
    [],
  );

  return suitablePriceFoodList;
};
