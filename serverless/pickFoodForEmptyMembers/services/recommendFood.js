/* eslint-disable prettier/prettier */
const get = require('lodash/get');
const intersection = require('lodash/intersection');
const { toNonAccentVietnamese } = require('../utils/string');
const { ALLERGIES_OPTIONS } = require('../utils/enums');

const getLabelByKey = (options, key) => {
  const option = options.find((item) => item.key === key);

  return get(option, 'label', '');
};

exports.recommendFood = (foodListings, subOrderFoodIds, allergies) => {
  const subOrderFoodList = foodListings.filter(
    (food) =>
      food.id?.uuid &&
      subOrderFoodIds.includes(food.id.uuid) &&
      !food?.attributes?.publicData?.foodType
        ?.toLowerCase()
        .includes('vegetarian'),
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

  console.log(
    'LOG ~ exports.recommendFood= ~ filteredFoodListByAllergies',
    filteredFoodListByAllergies?.length,
  );

  return filteredFoodListByAllergies[
    Math.floor(Math.random() * filteredFoodListByAllergies.length)
  ];
};
