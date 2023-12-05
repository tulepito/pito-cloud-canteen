import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import { useRouter } from 'next/router';

import IconArrow from '@components/Icons/IconArrow/IconArrow';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useFetchCompanyInfo from '@hooks/useFetchCompanyInfo';
import useFetchCompanyInfoCurrentUser from '@hooks/useFetchCompanyInfoCurrentUser';
import { useViewport } from '@hooks/useViewport';
import { companyThunks } from '@redux/slices/company.slice';
import { personalPaths } from '@src/paths';
import { Listing, User } from '@utils/data';
import type { TUser } from '@utils/types';

import type { TNutritionFormValues } from './components/NutritionForm/NutritionForm';
import NutritionForm from './components/NutritionForm/NutritionForm';

import css from './Nutrition.module.scss';

const NutritionPage = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isMobileLayout, isTabletLayout } = useViewport();
  const { companyId = '' } = router.query;
  if (companyId === 'personal') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useFetchCompanyInfoCurrentUser();
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useFetchCompanyInfo();
  }

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
  const fetchCompanyInfoInProgress = useAppSelector(
    (state) => state.company.fetchCompanyInfoInProgress,
  );
  const nutritionsOptions = useAppSelector(
    (state) => state.SystemAttributes.nutritions,
    shallowEqual,
  );
  const mealTypesOptions = useAppSelector(
    (state) => state.SystemAttributes.mealTypes,
  );

  const initialValues = useMemo(() => {
    return {
      nutritions,
      mealType,
      favoriteRestaurantList: favoriteRestaurants.map((restaurant) =>
        Listing(restaurant).getId(),
      ),
      favoriteFoodList: favoriteFood.map((food) => Listing(food).getId()),
    };
  }, [favoriteFood, favoriteRestaurants, nutritions, mealType]);

  const navigateAccountPersonalPage = () => {
    router.push({
      pathname: personalPaths.Account,
      query: { companyId: 'personal' },
    });
  };

  const handleSubmit = async (values: TNutritionFormValues) => {
    const publicData = {
      ...values,
    };
    await dispatch(companyThunks.updateCompanyAccount({ publicData }));
    if (isMobileLayout || isTabletLayout) {
      navigateAccountPersonalPage();
    }
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
            nutritionsOptions={nutritionsOptions}
            mealTypeOptions={mealTypesOptions}
          />
        </div>
      )}
    </div>
  );
};

export default NutritionPage;
