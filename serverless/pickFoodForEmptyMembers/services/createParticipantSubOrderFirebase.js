/* eslint-disable no-restricted-syntax */
const get = require('lodash/get');
const flatten = require('lodash/flatten');
const { addParticipantSubOrder } = require('./firebase/participantSubOrder');

module.exports = async ({
  groupFoodIdsBySubOrder,
  newOrderDetail,
  restaurantResponses,
  foodResponses,
  orderResponse,
  planResponse,
}) => {
  const createSubOrdersPromises = [];

  for (const subOrderDate of Object.keys(groupFoodIdsBySubOrder)) {
    const { memberIds = [] } = groupFoodIdsBySubOrder[subOrderDate];
    const subOrder = newOrderDetail[subOrderDate];
    const restaurantId = get(subOrder, 'restaurant.id', '');
    const restaurant = restaurantResponses.find(
      (_restaurant) => _restaurant.id.uuid === restaurantId,
    );

    const handlingCreateParticipantSubOrderByDate = memberIds.map(
      async (participantId) => {
        const foodId = get(
          subOrder,
          `memberOrders[${participantId}].foodId`,
          '',
        );
        const food = foodResponses.find((_food) => _food.id.uuid === foodId);

        await addParticipantSubOrder({
          participantId,
          order: orderResponse,
          plan: planResponse,
          food,
          restaurant,
          subOrderDate,
        });
      },
    );

    createSubOrdersPromises.push(...handlingCreateParticipantSubOrderByDate);
  }

  await Promise.allSettled(createSubOrdersPromises);

  return flatten(createSubOrdersPromises);
};
