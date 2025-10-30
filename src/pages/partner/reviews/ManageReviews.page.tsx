import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import RatingReview from '@components/RatingReview/RatingReview';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { useViewport } from '@hooks/useViewport';
import {
  fetchPartnerReviews,
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
  const { reviews, pagination, fetchReviewsInProgress, fetchReviewsError } =
    useAppSelector((state) => state.partnerReviews);
  const currentUser = useAppSelector(currentUserSelector);

  const currentUserGetter = CurrentUser(currentUser);
  const { displayName } = currentUserGetter.getProfile();

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    dispatch(fetchPartnerReviews({ page: newPage }));
  };

  useEffect(() => {
    dispatch(fetchPartnerReviews({}));
  }, [dispatch]);

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
  const ratingDetail = useAppSelector(
    (state) => state.ManageReviews.ratingDetail,
  );

  useEffect(() => {
    if (isFirstLoad) dispatch(ManageReviewsThunks.loadReviewSummarizeData());
  }, [isFirstLoad, dispatch]);

  // const handleFilterChange = ({
  //   ratings: ratingFormValue,
  // }: TPartnerReviewsFilterFormValues) => {
  //   router.replace({
  //     pathname: partnerPaths.ManageReviews,
  //     query: {
  //       ...(ratingFormValue.length
  //         ? { rating: ratingFormValue.join(',') }
  //         : {}),
  //     },
  //   });
  // };

  // const handleClearFilter = () => {
  //   router.replace({
  //     pathname: partnerPaths.ManageReviews,
  //     query: {},
  //   });
  // };
  const handleReply = async ({
    reviewId,
    replyRole,
    replyContent,
  }: {
    reviewId: string;
    replyRole: EUserRole;
    replyContent: string;
  }) => {
    await dispatch(
      submitReply({
        reviewId,
        replyRole,
        replyContent,
        authorId: currentUser?.id?.uuid || '',
        authorName: displayName || '',
      }),
    );
  };

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
      {/* <PartnerReviewDetailTable ratings={ratings} filterForm={filterForm} />
       */}
      <RatingReview
        reviews={reviews}
        fetchReviewsInProgress={fetchReviewsInProgress}
        fetchReviewsError={fetchReviewsError}
        pagination={pagination}
        handleReply={handleReply}
        handlePageChange={handlePageChange}
        page={page}
        ratingDetail={ratingDetail}
      />
    </div>
  );
};

export default ManageReviewsPage;
