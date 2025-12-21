const get = require('lodash/get');

function isSingleSelectionFood(foodListing) {
  if (!foodListing) {
    return false;
  }

  const numberOfMainDishes = get(
    foodListing,
    'attributes.publicData.numberOfMainDishes',
    null,
  );

  if (numberOfMainDishes === undefined || numberOfMainDishes === null) {
    return false;
  }

  return Number(numberOfMainDishes) === 1;
}

module.exports = {
  isSingleSelectionFood,
};
