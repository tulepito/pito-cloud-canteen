import { useEffect, useMemo } from 'react';
import { shallowEqual } from 'react-redux';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { UserPermission } from '@src/types/UserPermission';

import { BookerSelectRestaurantThunks } from '../BookerSelectRestaurant.slice';

const useRestaurantReview = () => {
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

  const selectedRestaurant = useMemo(
    () => seachResult.find((item) => item.id.uuid === selectedRestaurantId),
    [seachResult, selectedRestaurantId],
  );

  useEffect(() => {
    dispatch(
      BookerSelectRestaurantThunks.fetchRestaurantReviews({
        reviewRole: UserPermission.BOOKER,
      }),
    );
  }, []);
  useEffect(() => {
    dispatch(
      BookerSelectRestaurantThunks.fetchRestaurantReviews({
        reviewRole: UserPermission.PARTICIPANT,
      }),
    );
  }, []);

  return {
    restaurantBookerReviews,
    restaurantParticipantReviews,
    selectedRestaurant,
    restaurantBookerReviewers,
    restaurantParticipantReviewers,
  };
};

export default useRestaurantReview;
