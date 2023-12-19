import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import IconReviewEmpty from '@components/Icons/IconReviewEmpty/IconReviewEmpty';
import Pagination from '@components/Pagination/Pagination';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { useBottomScroll } from '@hooks/useBottomScroll';
import { useViewport } from '@hooks/useViewport';

import { ManageReviewsThunks } from '../../ManageReviews.slice';
import ReviewDetailCard from '../ReviewDetailCard/ReviewDetailCard';

import css from './PartnerReviewDetailTable.module.scss';

type TPartnerReviewDetailTableProps = {
  ratings: number[];
};

const PartnerReviewDetailTable: React.FC<TPartnerReviewDetailTableProps> = ({
  ratings,
}) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const { isMobileLayout } = useViewport();
  const [perPage, setPerPage] = useState(12);
  const [page, setPage] = useState(Number(1));

  const reviewsData = useAppSelector(
    (state) => state.ManageReviews.reviewDetailData,
  );
  const pagination = useAppSelector(
    (state) => state.ManageReviews.managePartnerReviewsPagination,
  );
  const fetchReviewDetailDataMoreInProgress = useAppSelector(
    (state) => state.ManageReviews.fetchReviewDetailDataMoreInProgress,
  );
  const fetchReviewDetailDataInProgress = useAppSelector(
    (state) => state.ManageReviews.fetchReviewDetailDataInProgress,
  );

  const paginationProps = {
    total: pagination.totalItems,
    current: pagination.page,
    pageSize: pagination.perPage,
  };
  // #END TODO FAKE Data to Test

  const handlePageChange = (pageValue: number) => {
    setPage(pageValue);
  };

  const handlePerPageChange = (perPageValue: number) => {
    setPerPage(perPageValue);
  };

  useEffect(() => {
    dispatch(
      ManageReviewsThunks.loadData({
        rating: ratings,
        page,
        pageSize: perPage,
        mode: isMobileLayout ? 'append' : 'replace',
      }),
    );
  }, [perPage, page, ratings, dispatch, isMobileLayout]);

  useBottomScroll(() => {
    if (!isMobileLayout) {
      return;
    }

    const canLoadMore = pagination.page < pagination.totalPages;
    const notLoading =
      !fetchReviewDetailDataMoreInProgress && !fetchReviewDetailDataInProgress;

    function increasePage() {
      setPage(page + 1);
    }

    if (isMobileLayout && canLoadMore && notLoading) {
      increasePage();
    }
  });

  return (
    <div className={css.reviewTableContent}>
      {reviewsData.length === 0 ? (
        <div className={css.dataEmtpy}>
          <IconReviewEmpty />
          <span className={classNames(css.dataEmptyTitle, css.normalText)}>
            {intl.formatMessage({
              id: 'ManagePartnerReviewsPage.emptyReviewDetailTitle',
            })}
          </span>
        </div>
      ) : fetchReviewDetailDataInProgress &&
        !fetchReviewDetailDataMoreInProgress ? (
        <div className={css.loading}>Loading...</div>
      ) : (
        reviewsData.map((r, i) => {
          return (
            <ReviewDetailCard
              rootClassName={css.partnerDetailCardContainer}
              key={i}
              data={r}
            />
          );
        })
      )}
      {!isMobileLayout &&
        !fetchReviewDetailDataInProgress &&
        reviewsData.length > 0 && (
          <Pagination
            showSizeChanger
            {...paginationProps}
            onChange={handlePageChange}
            onShowSizeChange={handlePerPageChange}
          />
        )}
    </div>
  );
};

export default PartnerReviewDetailTable;
