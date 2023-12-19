import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import classNames from 'classnames';
import { uniq } from 'lodash';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import IconFilter from '@components/Icons/IconFilter/IconFilter';
import IconReviewEmpty from '@components/Icons/IconReviewEmpty/IconReviewEmpty';
import Pagination from '@components/Pagination/Pagination';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import SlideModal from '@components/SlideModal/SlideModal';
import Tooltip from '@components/Tooltip/Tooltip';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { useViewport } from '@hooks/useViewport';
import { partnerPaths } from '@src/paths';

import type { TPartnerReviewsFilterFormValues } from './components/PartnerReviewsFilterForm/PartnerReviewsFilterForm';
import PartnerReviewsFilterForm from './components/PartnerReviewsFilterForm/PartnerReviewsFilterForm';
import ReviewDetailCard from './components/ReviewDetailCard/ReviewDetailCard';
import SummarizeReview from './components/SummarizeReview/SummarizeReview';
import { ManageReviewsThunks } from './ManageReviews.slice';

import css from './ManageReviews.module.scss';

const ManageReviewsPage = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const router = useRouter();
  const {
    query: { page: queryPage = 1, rating: queryRating },
  } = router;

  const { isMobileLayout } = useViewport();
  const [perPage, setPerPage] = useState(12);
  const filterPartnerFilterModalController = useBoolean();
  const [page, setPage] = useState(
    Number(Array.isArray(queryPage) ? 1 : queryPage),
  );

  const ratingDetail = useAppSelector(
    (state) => state.ManageReviews.ratingDetail,
  );
  const reviewsData = useAppSelector(
    (state) => state.ManageReviews.reviewDetailData,
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
  const totalReviewDetailData = useAppSelector(
    (state) => state.ManageReviews.totalReviewDetailData,
  );

  const fetchReviewDetailDatasInProgress = useAppSelector(
    (state) => state.ManageReviews.fetchReviewDetailDatasInProgress,
  );

  // #TODO FAKE Data to Test
  const paginationProps = {
    total: totalReviewDetailData,
    current: page,
    pageSize: perPage,
  };
  // #END TODO FAKE Data to Test

  const handlePageChange = (pageValue: number) => {
    setPage(pageValue);
  };

  const handlePerPageChange = (pageValue: number, perPageValue: number) => {
    setPerPage(perPageValue);
  };

  const handleFilterChange = ({ ratings }: TPartnerReviewsFilterFormValues) => {
    router.replace({
      pathname: partnerPaths.ManageReviews,
      query: {
        ...(ratings.length ? { rating: ratings.join(',') } : {}),
      },
    });
  };

  const handleClearFilter = () => {
    router.replace({
      pathname: partnerPaths.ManageReviews,
      query: {},
    });
  };

  const convertRatingToNumber = (rating: string) => {
    const result: number[] = [];
    rating.split(',').forEach((rate) => {
      result.push(Number(rate));
    });

    return result;
  };

  const ratings = useMemo(() => {
    const result = [];

    if (queryRating) {
      if (Array.isArray(queryRating)) {
        queryRating.forEach((rating) => {
          result.push(...convertRatingToNumber(rating));
        });
      } else {
        result.push(...convertRatingToNumber(queryRating));
      }
    }

    return uniq(result);
  }, [queryRating]);

  const filterForm = (
    <PartnerReviewsFilterForm
      onSubmit={handleFilterChange}
      onClearFilter={handleClearFilter}
      ratingDetail={ratingDetail}
      initialValues={{ ratings: uniq(ratings) }}
    />
  );

  useEffect(() => {
    if (isFirstLoad) dispatch(ManageReviewsThunks.loadReviewSummarizeData());

    dispatch(
      ManageReviewsThunks.loadData({
        rating: ratings,
        page,
        pageSize: perPage,
      }),
    );
  }, [isFirstLoad, perPage, page, ratings, dispatch]);

  return (
    <div className={css.root}>
      <div className={css.headerPage}>
        <span>{intl.formatMessage({ id: 'PartnerSidebar.reviews' })}</span>
      </div>
      <div className={css.SummarizeContainer}>
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

      <div className={css.reviewTable}>
        <div className={css.tableTitleContainer}>
          <span className={css.titleText}>
            {intl.formatMessage({
              id: 'ManagePartnerReviewsPage.reviewDetailTitle',
            })}
          </span>
          <RenderWhen condition={isMobileLayout}>
            <Button
              type="button"
              variant="secondary"
              onClick={filterPartnerFilterModalController.setTrue}
              className={css.filterButton}>
              <IconFilter className={css.filterIcon} />
              <FormattedMessage id="IntegrationFilterModal.filterMessage" />
            </Button>
            <RenderWhen.False>
              <Tooltip
                overlayClassName={css.filterBtnTooltipOverlay}
                tooltipContent={filterForm}
                trigger="click"
                placement="bottom">
                <Button
                  type="button"
                  variant="secondary"
                  className={css.filterButton}>
                  <IconFilter className={css.filterIcon} />
                  <FormattedMessage id="IntegrationFilterModal.filterMessage" />
                </Button>
              </Tooltip>
            </RenderWhen.False>
          </RenderWhen>
        </div>
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
          ) : fetchReviewDetailDatasInProgress ? (
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
            !fetchReviewDetailDatasInProgress &&
            reviewsData.length > 0 && (
              <Pagination
                showSizeChanger
                {...paginationProps}
                onChange={handlePageChange}
                onShowSizeChange={handlePerPageChange}
              />
            )}
        </div>
      </div>

      <RenderWhen condition={isMobileLayout}>
        <SlideModal
          id="FilterPartnerReviewModal"
          modalTitle={intl.formatMessage({
            id: 'ManagePartnerReviewsPage.filterButtonText',
          })}
          isOpen={filterPartnerFilterModalController.value}
          onClose={filterPartnerFilterModalController.setFalse}>
          {filterForm}
        </SlideModal>
      </RenderWhen>
    </div>
  );
};

export default ManageReviewsPage;
