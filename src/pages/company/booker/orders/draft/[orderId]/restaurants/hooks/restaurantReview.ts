import { useEffect, useMemo } from 'react';
import { shallowEqual } from 'react-redux';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';

import { BookerSelectRestaurantThunks } from '../BookerSelectRestaurant.slice';

const useRestaurantReview = (
  activeTab: 'booker' | 'participant',
  isViewAll: boolean = false,
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
  const restaurantBookerReviewers = useAppSelector(
    (state) => state.BookerSelectRestaurant.restaurantBookerReviewers,
    shallowEqual,
  );

  const restaurantParticipantReviewers = useAppSelector(
    (state) => state.BookerSelectRestaurant.restaurantParticipantReviewers,
    shallowEqual,
  );

  const selectedRestaurantId = useAppSelector(
    (state) => state.BookerSelectRestaurant.selectedRestaurantId,
  );

  const seachResult = useAppSelector(
    (state) => state.BookerSelectRestaurant.searchResult,
    shallowEqual,
  );

  const bookerReviewPagination = useAppSelector(
    (state) => state.BookerSelectRestaurant.bookerReviewPagination,
  );

  const participantReviewPagination = useAppSelector(
    (state) => state.BookerSelectRestaurant.participantReviewPagination,
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
        isViewAll,
        page,
      }),
    );
  }, [activeTab, dispatch, isViewAll, page]);

  return {
    restaurantBookerReviews,
    restaurantParticipantReviews,
    selectedRestaurant,
    restaurantBookerReviewers,
    restaurantParticipantReviewers,
    fetchRestaurantReviewInProgress,
    bookerReviewPagination,
    participantReviewPagination,
  };
};

export default useRestaurantReview;
