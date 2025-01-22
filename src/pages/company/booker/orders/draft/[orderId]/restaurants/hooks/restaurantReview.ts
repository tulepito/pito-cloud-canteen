import { useEffect, useMemo } from 'react';
import { shallowEqual } from 'react-redux';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';

import { BookerSelectRestaurantThunks } from '../BookerSelectRestaurant.slice';

const useRestaurantReview = (
  activeTab: 'booker' | 'participant',
  page: number = 1,
) => {
  const dispatch = useAppDispatch();

  const restaurantBookerReviews = useAppSelector(
    (state) => state.BookerSelectRestaurant.restaurantBookerReviews,
    shallowEqual,
  );

  const restaurantParticipantReviews = useAppSelector(
    (state) => state.BookerSelectRestaurant.restaurantParticipantReviews,
    shallowEqual,
  );

  const selectedRestaurantId = useAppSelector(
    (state) => state.BookerSelectRestaurant.selectedRestaurantId,
  );

  const seachResult = useAppSelector(
    (state) => state.BookerSelectRestaurant.searchResult,
    shallowEqual,
  );

  const restaurantBookerReviewsMeta = useAppSelector(
    (state) => state.BookerSelectRestaurant.restaurantBookerReviewsMeta,
  );

  const restaurantParticipantReviewsMeta = useAppSelector(
    (state) => state.BookerSelectRestaurant.restaurantParticipantReviewsMeta,
  );

  const fetchRestaurantReviewInProgress = useAppSelector(
    (state) => state.BookerSelectRestaurant.fetchRestaurantReviewInProgress,
  );

  const selectedRestaurant = useMemo(
    () => seachResult.find((item) => item.id.uuid === selectedRestaurantId),
    [seachResult, selectedRestaurantId],
  );

  useEffect(() => {
    dispatch(
      BookerSelectRestaurantThunks.fetchRestaurantReviews({
        reviewRole: activeTab,
        page,
      }),
    );
  }, [activeTab, dispatch, page]);

  return {
    restaurantBookerReviews,
    restaurantParticipantReviews,
    selectedRestaurant,
    fetchRestaurantReviewInProgress,
    restaurantBookerReviewsMeta,
    restaurantParticipantReviewsMeta,
  };
};

export default useRestaurantReview;
