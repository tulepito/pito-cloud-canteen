/* eslint-disable prettier/prettier */
const get = require('lodash/get');
const intersection = require('lodash/intersection');
const { toNonAccentVietnamese } = require('../utils/string');
const { ALLERGIES_OPTIONS } = require('../utils/enums');

const getLabelByKey = (options, key) => {
  const option = options.find((item) => item.key === key);

  return get(option, 'label', '');
};

exports.recommendFood = (foodList, subOrderFoodIds, allergies) => {
  const subOrderFoodList = foodList.filter(
    (food) => food.id?.uuid && subOrderFoodIds.includes(food.id.uuid),
  );

  const filteredFoodListByAllergies = subOrderFoodList.filter((food) => {
    const parsedFoodAllergies =
      food.attributes?.publicData?.allergicIngredients?.map(
        (_foodAllergy) => _foodAllergy && toNonAccentVietnamese(_foodAllergy),
      );
    const parsedAllergies = allergies.map((allergy) =>
      toNonAccentVietnamese(getLabelByKey(ALLERGIES_OPTIONS, allergy)),
    );
    const overlapAllergies = intersection(parsedFoodAllergies, parsedAllergies);

    return !overlapAllergies.length;
  });

  return filteredFoodListByAllergies[
    Math.floor(Math.random() * filteredFoodListByAllergies.length)
  ];
};
