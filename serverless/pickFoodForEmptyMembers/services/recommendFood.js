/* eslint-disable prettier/prettier */
const get = require('lodash/get');
const intersection = require('lodash/intersection');
const maxBy = require('lodash/maxBy');
const random = require('lodash/random');
const { toNonAccentVietnamese } = require('../utils/string');
const { ALLERGIES_OPTIONS } = require('../utils/enums');

const getLabelByKey = (options, key) => {
  const option = options.find((item) => item.key === key);

  return get(option, 'label', '');
};

exports.recommendFood = (foodList, subOrderFoodIds, allergies) => {
  const subOrderFoodList = foodList.filter((food) =>
    subOrderFoodIds.includes(food.id.uuid),
  );

  const filteredFoodListByAllergies = subOrderFoodList.filter(
    (food) =>
      intersection(
        get(food, 'attributes.publicData.allergicIngredients', []).map(
          (_foodAllergy) => toNonAccentVietnamese(_foodAllergy),
        ),
        allergies.map((allergy) =>
          toNonAccentVietnamese(getLabelByKey(ALLERGIES_OPTIONS, allergy)),
        ),
      ).length === 0,
  );
  const isAllFoodHaveAllergies = filteredFoodListByAllergies.length === 0;

  const foodListToFilter = isAllFoodHaveAllergies
    ? subOrderFoodList
    : filteredFoodListByAllergies;

  const isAllFoodHaveNoRating = foodListToFilter.every(
    (food) => !get(food, 'attributes.metadata.rating'),
  );

  const randomFood =
    foodListToFilter[Math.floor(Math.random() * foodListToFilter.length)];

  const mostSuitableFood = isAllFoodHaveNoRating
    ? maxBy(foodListToFilter, (food) =>
      get(food, 'attributes.metadata.pickingTime', 0),
    )
    : maxBy(foodListToFilter, (food) =>
      get(food, 'attributes.metadata.rating', 0),
    );

  return random() === 1 ? randomFood : mostSuitableFood;
};
