import { useIntl } from 'react-intl';

export const nutritionOptions = [
  { key: 'vegetarian', label: 'Nutrition.vegetarian' },
  { key: 'noGluten', label: 'Nutrition.noGluten' },
  { key: 'keto', label: 'Nutrition.keto' },
];

export const menuTypesOptions = [
  { key: 'fixed-menu', label: 'SearchFilter.menu.fixed-menu' },
  { key: 'cycle-menu', label: 'SearchFilter.menu.cycle-menu' },
];

/**
 * @deprecated
 */
export const distanceOptions = [
  { key: '2', label: 'Dưới 2km' },
  { key: '3', label: 'Dưới 3km' },
  { key: '5', label: 'Dưới 5km' },
];

/**
 * @deprecated
 */
export const ratingOptions = [
  { key: '1', label: '1 sao trở lên' },
  { key: '2', label: '2 sao trở lên' },
  { key: '3', label: '3 sao trở lên' },
  { key: '4', label: '4 sao trở lên' },
  { key: '5', label: '5 sao' },
];

/**
 * @deprecated
 */
export const mealTypeOptions = [
  { key: 'vegetarian', label: 'Món chay' },
  { key: 'unVegetarian', label: 'Món mặn' },
];

export const useOptionLabelsByLocale = () => {
  const intl = useIntl();

  const _distanceOptions = [
    { key: '2', label: intl.formatMessage({ id: 'duoi-2km' }) },
    { key: '3', label: intl.formatMessage({ id: 'duoi-3km' }) },
    { key: '5', label: intl.formatMessage({ id: 'duoi-5km' }) },
  ];

  const _ratingOptions = [
    { key: '1', label: intl.formatMessage({ id: '1-sao-tro-len' }) },
    { key: '2', label: intl.formatMessage({ id: '2-sao-tro-len' }) },
    { key: '3', label: intl.formatMessage({ id: '3-sao-tro-len' }) },
    { key: '4', label: intl.formatMessage({ id: '4-sao-tro-len' }) },
    { key: '5', label: intl.formatMessage({ id: '5-sao' }) },
  ];

  const _mealTypeOptions = [
    { key: 'vegetarian', label: intl.formatMessage({ id: 'mon-chay' }) },
    { key: 'unVegetarian', label: intl.formatMessage({ id: 'mon-man' }) },
  ];

  return {
    distanceOptions: _distanceOptions,
    ratingOptions: _ratingOptions,
    mealTypeOptions: _mealTypeOptions,
  };
};
