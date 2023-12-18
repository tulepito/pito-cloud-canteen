import React, { useMemo, useState } from 'react';
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
import useBoolean from '@hooks/useBoolean';
import { useViewport } from '@hooks/useViewport';
import { partnerPaths } from '@src/paths';

import type { TPartnerReviewsFilterFormValues } from './components/PartnerReviewsFilterForm/PartnerReviewsFilterForm';
import PartnerReviewsFilterForm from './components/PartnerReviewsFilterForm/PartnerReviewsFilterForm';
import ReviewDetailCard from './components/ReviewDetailCard/ReviewDetailCard';
import SummarizeReview from './components/SummarizeReview/SummarizeReview';

import css from './ManageReviews.module.scss';

export type TReviewContent = {
  id: number;
  name: string;
  rating: number;
  foodRating: number;
  eatingUtensilRating: number;
  description: string;
  foodName: string;
  orderDate: Date;
  avatar: string;
};

const RATTING_OPTIONS = [
  {
    key: 'very_bad',
    value: 1,
  },
  {
    key: 'bad',
    value: 2,
  },
  {
    key: 'normal',
    value: 3,
  },
  {
    key: 'good',
    value: 4,
  },
  {
    key: 'excellent',
    value: 5,
  },
];

const ManageReviewsPage = () => {
  const intl = useIntl();
  const router = useRouter();
  const {
    query: { page: queryPage = 1, type: queryRatting },
    // isReady,
  } = router;

  const { isMobileLayout } = useViewport();
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(
    Number(Array.isArray(queryPage) ? 1 : queryPage),
  );
  const filterPartnerFilterModalController = useBoolean();

  // #TODO FAKE Data to Test
  const food = 4.2;
  const packaging = 4.2;
  const pointRating = 4.8;
  const totalRating = 800;
  const reviewsData: TReviewContent[] = [
    {
      id: 1,
      name: 'vy',
      rating: 3,
      foodName: 'Hàu nướng phô mai',
      foodRating: 3,
      description:
        'Lorem ipsum dolor sit amet consectetur. Sagittis auctor sit vulputate pulvinar proin at ut amet.Lorem ipsum dolor sit amet consectetur. Sagittis auctor sit vulputate pulvinar proin at ut amet.Lorem ipsum dolor sit amet consectetur. Sagittis auctor sit vulputate pulvinar proin at ut amet.Lorem ipsum dolor sit amet consectetur. Sagittis auctor sit vulputate pulvinar proin at ut amet.',
      eatingUtensilRating: 3,
      orderDate: new Date(),
      avatar: 'avatar',
    },
    {
      id: 2,
      name: 'vy',
      rating: 3,
      foodName: 'Hàu nướng phô mai',
      foodRating: 3,
      description:
        'Lorem ipsum dolor sit amet consectetur. Sagittis auctor sit vulputate pulvinar proin at ut amet.',
      eatingUtensilRating: 3,
      orderDate: new Date(),
      avatar: 'avatar',
    },
    {
      id: 3,
      name: 'vy',
      rating: 3,
      foodName: 'Hàu nướng phô mai',
      foodRating: 3,
      description:
        'Lorem ipsum dolor sit amet consectetur. Sagittis auctor sit vulputate pulvinar proin at ut amet.',
      eatingUtensilRating: 3,
      orderDate: new Date(),
      avatar: 'avatar',
    },
    {
      id: 4,
      name: 'vy',
      rating: 3,
      foodName: 'Hàu nướng phô mai',
      foodRating: 3,
      description:
        'Lorem ipsum dolor sit amet consectetur. Sagittis auctor sit vulputate pulvinar proin at ut amet.',
      eatingUtensilRating: 3,
      orderDate: new Date(),
      avatar: 'avatar',
    },
    {
      id: 1,
      name: 'vy',
      rating: 3,
      foodName: 'Hàu nướng phô mai',
      foodRating: 3,
      description:
        'Lorem ipsum dolor sit amet consectetur. Sagittis auctor sit vulputate pulvinar proin at ut amet.',
      eatingUtensilRating: 3,
      orderDate: new Date(),
      avatar: 'avatar',
    },
    {
      id: 1,
      name: 'vy',
      rating: 3,
      foodName: 'Hàu nướng phô mai',
      foodRating: 3,
      description:
        'Lorem ipsum dolor sit amet consectetur. Sagittis auctor sit vulputate pulvinar proin at ut amet.',
      eatingUtensilRating: 3,
      orderDate: new Date(),
      avatar: 'avatar',
    },
    {
      id: 1,
      name: 'vy',
      rating: 3,
      foodName: 'Hàu nướng phô mai',
      foodRating: 3,
      description:
        'Lorem ipsum dolor sit amet consectetur. Sagittis auctor sit vulputate pulvinar proin at ut amet.',
      eatingUtensilRating: 3,
      orderDate: new Date(),
      avatar: 'avatar',
    },
    {
      id: 1,
      name: 'vy',
      rating: 3,
      foodName: 'Hàu nướng phô mai',
      foodRating: 3,
      description:
        'Lorem ipsum dolor sit amet consectetur. Sagittis auctor sit vulputate pulvinar proin at ut amet.',
      eatingUtensilRating: 3,
      orderDate: new Date(),
      avatar: 'avatar',
    },
    {
      id: 1,
      name: 'vy',
      rating: 3,
      foodName: 'Hàu nướng phô mai',
      foodRating: 3,
      description:
        'Lorem ipsum dolor sit amet consectetur. Sagittis auctor sit vulputate pulvinar proin at ut amet.',
      eatingUtensilRating: 3,
      orderDate: new Date(),
      avatar: 'avatar',
    },
    {
      id: 1,
      name: 'vy',
      rating: 3,
      foodName: 'Hàu nướng phô mai',
      foodRating: 3,
      description:
        'Lorem ipsum dolor sit amet consectetur. Sagittis auctor sit vulputate pulvinar proin at ut amet.',
      eatingUtensilRating: 3,
      orderDate: new Date(),
      avatar: 'avatar',
    },
  ];
  const paginationProps = {
    total: reviewsData.length,
    current: page,
    pageSize: perPage,
  };
  const ratingScore = [
    { score: 1, total: 0 },
    { score: 2, total: 100 },
    { score: 3, total: 20 },
    { score: 4, total: 8 },
    { score: 5, total: 19 },
  ];
  // #END TODO FAKE Data to Test

  const handlePageChange = (pageValue: number) => {
    setPage(pageValue);
  };

  const handlePerPageChange = (pageValue: number, perPageValue: number) => {
    setPerPage(perPageValue);
  };

  const handleFilterChange = ({
    rattings,
  }: TPartnerReviewsFilterFormValues) => {
    const rattingConverted: string[] = [];
    rattings.forEach((filterRatting) => {
      const ratingOption = RATTING_OPTIONS.find((option) => {
        return option.value === filterRatting;
      });
      if (ratingOption) {
        rattingConverted.push(ratingOption.key);
      }
    });
    router.replace({
      pathname: partnerPaths.ManageReviews,
      query: {
        ...(rattingConverted.length
          ? { type: rattingConverted.join(',') }
          : {}),
      },
    });
  };

  const handleClearFilter = () => {
    router.replace({
      pathname: partnerPaths.ManageReviews,
      query: {},
    });
  };

  const convertRattingToNumber = (ratting: string) => {
    const result: number[] = [];
    ratting.split(',').forEach((rate) => {
      const ratingOption = RATTING_OPTIONS.find((option) => {
        return option.key === rate;
      });
      if (ratingOption) {
        result.push(ratingOption.value);
      }
    });

    return result;
  };

  const initialFilterFormValues = useMemo(() => {
    const rattings = [];

    if (queryRatting) {
      if (Array.isArray(queryRatting)) {
        queryRatting.forEach((ratting) => {
          rattings.push(...convertRattingToNumber(ratting));
        });
      } else {
        rattings.push(...convertRattingToNumber(queryRatting));
      }
    }

    return { rattings: uniq(rattings) };
  }, [queryRatting]);

  const filterForm = (
    <PartnerReviewsFilterForm
      onSubmit={handleFilterChange}
      onClearFilter={handleClearFilter}
      ratingScore={ratingScore}
      initialValues={initialFilterFormValues}
    />
  );

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
          foodRating={food}
          packagingRating={packaging}
          pointRating={pointRating}
          totalRating={totalRating}
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
          ) : (
            reviewsData.map((r, i) => {
              return <ReviewDetailCard key={i} data={r} />;
            })
          )}
          {!isMobileLayout && (
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
