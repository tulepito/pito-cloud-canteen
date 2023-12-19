import React, { useEffect, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import classNames from 'classnames';
import { uniq } from 'lodash';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import IconFilter from '@components/Icons/IconFilter/IconFilter';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import SlideModal from '@components/SlideModal/SlideModal';
import Tooltip from '@components/Tooltip/Tooltip';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { useViewport } from '@hooks/useViewport';
import { partnerPaths } from '@src/paths';

import PartnerReviewDetailTable from './components/PartnerReviewDetailTable/PartnerReviewDetailTable';
import type { TPartnerReviewsFilterFormValues } from './components/PartnerReviewsFilterForm/PartnerReviewsFilterForm';
import PartnerReviewsFilterForm from './components/PartnerReviewsFilterForm/PartnerReviewsFilterForm';
import SummarizeReview from './components/SummarizeReview/SummarizeReview';
import { ManageReviewsThunks } from './ManageReviews.slice';

import css from './ManageReviews.module.scss';

const ManageReviewsPage = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const router = useRouter();
  const {
    query: { rating: queryRating },
  } = router;

  const { isMobileLayout } = useViewport();
  const filterPartnerFilterModalController = useBoolean();

  const ratingDetail = useAppSelector(
    (state) => state.ManageReviews.ratingDetail,
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
  }, [isFirstLoad, dispatch]);

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
        <PartnerReviewDetailTable ratings={ratings} />
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
