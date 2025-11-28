/* eslint-disable prettier/prettier */
const get = require('lodash/get');
const intersection = require('lodash/intersection');
const { toNonAccentVietnamese } = require('../utils/string');
const { ALLERGIES_OPTIONS } = require('../utils/enums');

const getLabelByKey = (options, key) => {
  const option = options.find((item) => item.key === key);

  return get(option, 'label', '');
};

exports.recommendFood = (
  foodListings,
  subOrderFoodIds,
  allergies,
  isVegetarianOnly = false,
) => {
  const subOrderFoodList = foodListings.filter((food) => {
    if (!food.id?.uuid || !subOrderFoodIds.includes(food.id.uuid)) {
      return false;
    }

    const foodType =
      food?.attributes?.publicData?.foodType?.toLowerCase() || '';
    const isVegetarian = foodType.includes('vegetarian');

    // If isVegetarianOnly = true, only pick vegetarian food
    // If isVegetarianOnly = false, remove vegetarian food (old logic)
    return isVegetarianOnly ? isVegetarian : !isVegetarian;
  });

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
