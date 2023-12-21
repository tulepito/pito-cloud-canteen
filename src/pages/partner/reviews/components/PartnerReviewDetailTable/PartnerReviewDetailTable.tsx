import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import classNames from 'classnames';

import Button from '@components/Button/Button';
import IconFilter from '@components/Icons/IconFilter/IconFilter';
import IconReviewEmpty from '@components/Icons/IconReviewEmpty/IconReviewEmpty';
import Pagination from '@components/Pagination/Pagination';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import SlideModal from '@components/SlideModal/SlideModal';
import Tooltip from '@components/Tooltip/Tooltip';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { useBottomScroll } from '@hooks/useBottomScroll';
import { useViewport } from '@hooks/useViewport';

import { ManageReviewsThunks } from '../../ManageReviews.slice';
import ReviewDetailCard from '../ReviewDetailCard/ReviewDetailCard';

import css from './PartnerReviewDetailTable.module.scss';

type TPartnerReviewDetailTableProps = {
  ratings: number[];
  filterForm: any;
};

const PartnerReviewDetailTable: React.FC<TPartnerReviewDetailTableProps> = ({
  ratings,
  filterForm,
}) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const { isMobileLayout } = useViewport();
  const [perPage, setPerPage] = useState(12);
  const [page, setPage] = useState(Number(1));
  const filterPartnerFilterModalController = useBoolean();

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

  const paginationProps = useMemo(
    () => ({
      total: pagination.totalItems,
      current: pagination.page,
      pageSize: pagination.perPage,
    }),
    [pagination],
  );

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
        {fetchReviewDetailDataInProgress &&
        !fetchReviewDetailDataMoreInProgress ? (
          <div className={css.loading}>Loading...</div>
        ) : reviewsData.length === 0 ? (
          <div className={css.dataEmtpy}>
            <IconReviewEmpty />
            <span className={classNames(css.dataEmptyTitle, css.normalText)}>
              {intl.formatMessage({
                id: 'ManagePartnerReviewsPage.emptyReviewDetailTitle',
              })}
            </span>
          </div>
        ) : (
          <>
            {reviewsData.map((r, i) => {
              return (
                <ReviewDetailCard
                  rootClassName={css.partnerDetailCardContainer}
                  key={i}
                  data={r}
                />
              );
            })}
            {!isMobileLayout && (
              <Pagination
                showSizeChanger
                {...paginationProps}
                onChange={handlePageChange}
                onShowSizeChange={handlePerPageChange}
              />
            )}
          </>
        )}
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

export default PartnerReviewDetailTable;
