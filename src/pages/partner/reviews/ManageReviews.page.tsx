import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { toast } from 'react-toastify';
import { isAxiosError } from 'axios';
import classNames from 'classnames';

import RatingReview from '@components/RatingReview/RatingReview';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { useViewport } from '@hooks/useViewport';
import {
  fetchPartnerReviews,
  setFilters,
  submitReply,
} from '@redux/slices/Reviews.partner.slice';
import { currentUserSelector } from '@redux/slices/user.slice';
import { CurrentUser } from '@src/utils/data';
import type { EUserRole } from '@src/utils/enums';

import SummarizeReview from './components/SummarizeReview/SummarizeReview';
import { ManageReviewsThunks } from './ManageReviews.slice';

import css from './ManageReviews.module.scss';

const ManageReviewsPage = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const { isMobileLayout } = useViewport();

  const FIRST_PAGE = 1;
  const [page, setPage] = useState(FIRST_PAGE);
  const {
    reviews,
    pagination,
    fetchReviewsInProgress,
    fetchReviewsError,
    filters,
  } = useAppSelector((state) => state.partnerReviews);
  const currentUser = useAppSelector(currentUserSelector);

  const currentUserGetter = CurrentUser(currentUser);
  const { displayName } = currentUserGetter.getProfile();

  const filtersRef = useRef(filters);

  // Keep filtersRef in sync with filters
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    dispatch(fetchPartnerReviews({}));
  }, [dispatch]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      dispatch(fetchPartnerReviews({ ...filtersRef.current, page: newPage }));
    },
    [dispatch],
  );

  const handleSearch = useCallback(
    (orderCode: string) => {
      const trimmedOrderCode = orderCode.trim();
      const newOrderCode = trimmedOrderCode || undefined;
      const newFilters = { ...filtersRef.current, orderCode: newOrderCode };
      dispatch(setFilters({ orderCode: newOrderCode }));
      dispatch(fetchPartnerReviews({ ...newFilters, page: 1 }));
    },
    [dispatch],
  );

  const handleFilterRating = useCallback(
    (ratings: number[]) => {
      const newFilters = { ...filtersRef.current, ratings };
      dispatch(setFilters({ ratings }));
      dispatch(fetchPartnerReviews({ ...newFilters, page: 1 }));
    },
    [dispatch],
  );

  const averageFoodRating = useAppSelector(
    (state) => state.ManageReviews.averageFoodRating,
  );
  const averagePackagingRating = useAppSelector(
    (state) => state.ManageReviews.averagePackagingRating,
  );
  const isFirstLoad = useAppSelector(
    (state) => state.ManageReviews.isFirstLoad,
  );
  const averageTotalRating = useAppSelector(
    (state) => state.ManageReviews.averageTotalRating,
  );
  const totalNumberOfReivews = useAppSelector(
    (state) => state.ManageReviews.totalNumberOfReivews,
  );

  useEffect(() => {
    if (isFirstLoad) dispatch(ManageReviewsThunks.loadReviewSummarizeData());
  }, [isFirstLoad, dispatch]);

  const handleReply = useCallback(
    async ({
      reviewId,
      replyRole,
      replyContent,
    }: {
      reviewId: string;
      replyRole: EUserRole;
      replyContent: string;
    }) => {
      try {
        await dispatch(
          submitReply({
            reviewId,
            replyRole,
            replyContent,
            authorId: currentUser?.id?.uuid || '',
            authorName: displayName || '',
          }),
        ).unwrap();
      } catch (error) {
        console.error('Error submitting reply:', error);
        let message = 'Có lỗi xảy ra. Vui lòng thử lại.';
        if (isAxiosError(error)) {
          const data = error.response?.data as { error?: string } | undefined;
          message = data?.error ?? error.message;
        } else if (error instanceof Error) {
          message = error.message;
        }
        toast.error(message);
      }
    },
    [dispatch, currentUser?.id?.uuid, displayName],
  );

  return (
    <div className={css.root}>
      <div
        className={classNames(
          css.headerPage,
          isMobileLayout ? css.headerMobliePage : '',
        )}>
        {intl.formatMessage({ id: 'PartnerSidebar.reviews' })}
      </div>
      <div className={css.summarizeContainer}>
        <span className={classNames(css.titleText)}>
          {intl.formatMessage({ id: 'ManagePartnerReviewsPage.overView' })}
        </span>
        <SummarizeReview
          averageFoodRating={averageFoodRating}
          averagePackagingRating={averagePackagingRating}
          averageTotalRating={averageTotalRating}
          totalNumberOfReivews={totalNumberOfReivews}
        />
      </div>
      <RatingReview
        reviews={reviews}
        fetchReviewsInProgress={fetchReviewsInProgress}
        fetchReviewsError={fetchReviewsError}
        pagination={pagination}
        handleReply={handleReply}
        handlePageChange={handlePageChange}
        handleSearch={handleSearch}
        handleFilterRating={handleFilterRating}
        page={page}
        isShowFilters={true}
        selectedRatings={filters.ratings}
      />
    </div>
  );
};

export default ManageReviewsPage;
