import { useEffect } from 'react';
import { shallowEqual } from 'react-redux';
import { DateTime } from 'luxon';
import { useRouter } from 'next/router';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { selectCalendarDate } from '@redux/slices/Order.slice';

import { BookerSelectRestaurantThunks } from '../BookerSelectRestaurant.slice';
import { convertQueryValueToArray } from '../helpers/urlQuery';

export const useSearchRestaurants = () => {
  const dispatch = useAppDispatch();

  const router = useRouter();
  const {
    timestamp,
    orderId,
    page = 1,
    menuTypes,
    categories,
    distance,
    rating,
    keywords,
    packaging,
  } = router.query;

  const restaurants = useAppSelector(
    (state) => state.BookerSelectRestaurant.searchResult,
    shallowEqual,
  );
  const searchInProgress = useAppSelector(
    (state) => state.BookerSelectRestaurant.searchInProgress,
  );

  const totalResultItems = useAppSelector(
    (state) => state.BookerSelectRestaurant.totalItems,
  );

  const combinedRestaurantInFoods = useAppSelector(
    (state) => state.BookerSelectRestaurant.combinedRestaurantInFoods,
  );

  useEffect(() => {
    dispatch(
      selectCalendarDate(DateTime.fromMillis(Number(timestamp)).toJSDate()),
    );
  }, [dispatch, timestamp]);

  useEffect(() => {
    dispatch(
      BookerSelectRestaurantThunks.searchRestaurants({
        timestamp: Number(timestamp),
        orderId: orderId as string,
        page: Number(page),
        ...(menuTypes
          ? { menuTypes: convertQueryValueToArray(menuTypes) }
          : {}),
        ...(categories
          ? { categories: convertQueryValueToArray(categories) }
          : {}),
        ...(distance ? { distance: convertQueryValueToArray(distance) } : {}),
        ...(rating ? { rating: convertQueryValueToArray(rating) } : {}),
        ...(packaging
          ? { packaging: convertQueryValueToArray(packaging) }
          : {}),
        ...(keywords ? { keywords: keywords as string } : {}),
      }),
    );
  }, [
    categories,
    dispatch,
    distance,
    menuTypes,
    orderId,
    page,
    rating,
    timestamp,
    keywords,
    packaging,
  ]);

  return {
    restaurants,
    searchInProgress,
    totalResultItems,
    combinedRestaurantInFoods,
  };
};

export const useGetRestaurant = () => {
  const router = useRouter();
  const { restaurantId } = router.query;

  const dispatch = useAppDispatch();

  const restaurant = useAppSelector(
    (state) => state.BookerSelectRestaurant.restaurant,
    shallowEqual,
  );

  useEffect(() => {
    dispatch(
      BookerSelectRestaurantThunks.fetchRestaurant(restaurantId as string),
    );
  }, [restaurantId, dispatch]);

  return { restaurant };
};
