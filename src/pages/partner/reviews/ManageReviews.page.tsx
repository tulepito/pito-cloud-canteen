import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import classNames from 'classnames';

import Button from '@components/Button/Button';
import IconFilter from '@components/Icons/IconFilter/IconFilter';
import IconReviewEmpty from '@components/Icons/IconReviewEmpty/IconReviewEmpty';
import Pagination from '@components/Pagination/Pagination';
import { useViewport } from '@hooks/useViewport';

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

const ManageReviewsPage = () => {
  const intl = useIntl();
  const { isMobileLayout } = useViewport();
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);

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
  // #END TODO FAKE Data to Test

  const handlePageChange = (pageValue: number) => {
    setPage(pageValue);
  };

  const handlePerPageChange = (pageValue: number, perPageValue: number) => {
    setPerPage(perPageValue);
  };

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
          <Button
            type="button"
            variant="secondary"
            className={css.filterButton}>
            <IconFilter className={css.filterIcon} />
            <FormattedMessage id="IntegrationFilterModal.filterMessage" />
          </Button>
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
    </div>
  );
};

export default ManageReviewsPage;
