import { BookerSelectRestaurantThunks } from '@pages/company/booker/orders/draft/[orderId]/restaurants/BookerSelectRestaurant.slice';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { shallowEqual } from 'react-redux';

import { useAppDispatch, useAppSelector } from './reduxHooks';

const useFetchSearchFilters = () => {
  const dispatch = useAppDispatch();
  const { isReady } = useRouter();

  const menuTypesOptions = useAppSelector(
    (state) => state.BookerSelectRestaurant.menuTypes,
    shallowEqual,
  );

  const categoriesOptions = useAppSelector(
    (state) => state.BookerSelectRestaurant.categories,
    shallowEqual,
  );

  const packagingOptions = useAppSelector(
    (state) => state.BookerSelectRestaurant.packaging,
    shallowEqual,
  );

  useEffect(() => {
    if (isReady) {
      (async () => {
        await dispatch(BookerSelectRestaurantThunks.fetchSearchFilter());
      })();
    }
  }, [dispatch, isReady]);

  return {
    menuTypesOptions,
    categoriesOptions,
    packagingOptions,
  };
};

export default useFetchSearchFilters;
