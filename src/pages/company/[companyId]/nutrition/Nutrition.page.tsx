import { useAppSelector } from '@hooks/reduxHooks';
import useFetchCompanyInfo from '@hooks/useFetchCompanyInfo';
import { USER } from '@utils/data';
import type { TUser } from '@utils/types';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import type { TNutritionFormValues } from './components/NutritionForm/NutritionForm';
import NutritionForm from './components/NutritionForm/NutritionForm';
import css from './Nutrition.module.scss';

const NutritionPage = () => {
  const intl = useIntl();
  useFetchCompanyInfo();
  const company = useAppSelector(
    (state) => state.company.company,
    shallowEqual,
  );
  const { nutritions = [] } = USER(company as TUser).getPublicData();
  const favoriteRestaurants = useAppSelector(
    (state) => state.company.favoriteRestaurants,
    shallowEqual,
  );
  const favoriteFood = useAppSelector(
    (state) => state.company.favoriteFood,
    shallowEqual,
  );
  const initialValues = useMemo(
    () => ({
      nutritions,
      favoriteRestaurantList: favoriteRestaurants,
      favoriteFoodList: favoriteFood,
    }),
    [favoriteFood, favoriteRestaurants, nutritions],
  );
  const onSubmit = (values: TNutritionFormValues) => {
    console.log('values: ', values);
  };
  return (
    <div className={css.container}>
      <div className={css.header}>
        {intl.formatMessage({ id: 'NutritionPage.nutrition' })}
      </div>
      <div className={css.uploadImageFormWrapper}>
        <NutritionForm initialValues={initialValues} onSubmit={onSubmit} />
      </div>
    </div>
  );
};

export default NutritionPage;
