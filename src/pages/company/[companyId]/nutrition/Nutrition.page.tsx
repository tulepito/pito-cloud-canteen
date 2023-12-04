import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import { useRouter } from 'next/router';

import IconArrow from '@components/Icons/IconArrow/IconArrow';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useFetchCompanyInfo from '@hooks/useFetchCompanyInfo';
import { useViewport } from '@hooks/useViewport';
import { companyThunks } from '@redux/slices/company.slice';
import { personalPaths } from '@src/paths';
import { CurrentUser, Listing, User } from '@utils/data';
import type { TUser } from '@utils/types';

import type { TNutritionFormValues } from './components/NutritionForm/NutritionForm';
import NutritionForm from './components/NutritionForm/NutritionForm';

import css from './Nutrition.module.scss';

const NutritionPage = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isMobileLayout, isTabletLayout } = useViewport();
  const { companyId } = router.query;
  useFetchCompanyInfo();

  const company = useAppSelector(
    (state) => state.company.company,
    shallowEqual,
  );
  const { nutritions = [], mealType = [] } = User(
    company as TUser,
  ).getPublicData();
  const favoriteRestaurants = useAppSelector(
    (state) => state.company.favoriteRestaurants,
    shallowEqual,
  );
  const favoriteFood = useAppSelector(
    (state) => state.company.favoriteFood,
    shallowEqual,
  );
  const currentUser = useAppSelector(
    (state) => state.user.currentUser,
    shallowEqual,
  );
  const personalFavoriteRestaurants = useAppSelector(
    (state) => state.user.favoriteRestaurants,
    shallowEqual,
  );
  const personalFavoriteFood = useAppSelector(
    (state) => state.user.favoriteFood,
    shallowEqual,
  );
  const fetchCompanyInfoInProgress = useAppSelector(
    (state) => state.company.fetchCompanyInfoInProgress,
  );
  const nutritionsOptions = useAppSelector(
    (state) => state.SystemAttributes.nutritions,
    shallowEqual,
  );
  const menuTypesOptions = useAppSelector(
    (state) => state.SystemAttributes.menuTypes,
  );
  const {
    nutritions: personalNutritions = [],
    mealTypes: personalMealType = [],
  } = CurrentUser(currentUser!).getPublicData();
  const isPersonal = companyId === 'personal';

  const initialValues = useMemo(
    () =>
      isPersonal
        ? {
            nutritions: personalNutritions,
            mealType: personalMealType,
            favoriteRestaurantList: personalFavoriteRestaurants.map(
              (restaurant) => Listing(restaurant).getId(),
            ),
            favoriteFoodList: personalFavoriteFood.map((food) =>
              Listing(food).getId(),
            ),
          }
        : {
            nutritions,
            mealType,
            favoriteRestaurantList: favoriteRestaurants.map((restaurant) =>
              Listing(restaurant).getId(),
            ),
            favoriteFoodList: favoriteFood.map((food) => Listing(food).getId()),
          },
    [
      favoriteFood,
      favoriteRestaurants,
      isPersonal,
      nutritions,
      mealType,
      personalFavoriteFood,
      personalFavoriteRestaurants,
      personalNutritions,
      personalMealType,
    ],
  );

  const handleSubmit = (values: TNutritionFormValues) => {
    const publicData = {
      ...values,
    };
    dispatch(companyThunks.updateCompanyAccount({ publicData }));
  };
  const navigateAccountPersonalPage = () => {
    router.push({
      pathname: personalPaths.Account,
      query: { companyId: 'personal' },
    });
  };

  return (
    <div className={css.container}>
      <div className={css.header}>
        {(isMobileLayout || isTabletLayout) && (
          <IconArrow direction="left" onClick={navigateAccountPersonalPage} />
        )}
        <span>{intl.formatMessage({ id: 'NutritionPage.nutrition' })}</span>
      </div>
      {fetchCompanyInfoInProgress ? (
        <div className={css.loading}>
          {intl.formatMessage({ id: 'NutritionPage.loadingText' })}
        </div>
      ) : (
        <div>
          <NutritionForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            isPersonal={isPersonal}
            nutritionsOptions={nutritionsOptions}
            mealTypeOptions={menuTypesOptions}
          />
        </div>
      )}
    </div>
  );
};

export default NutritionPage;
