import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import classNames from 'classnames';
import { DateTime } from 'luxon';

import Button from '@components/Button/Button';
import IconFilter from '@components/Icons/IconFilter/IconFilter';
import IconReviewEmpty from '@components/Icons/IconReviewEmpty/IconReviewEmpty';

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
  orderDate: DateTime;
  avatar: string;
};

const ManageReviewsPage = () => {
  const intl = useIntl();

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
        'Lorem ipsum dolor sit amet consectetur. Sagittis auctor sit vulputate pulvinar proin at ut amet.',
      eatingUtensilRating: 3,
      orderDate: DateTime.now(),
      avatar: 'avatar',
    },
  ];

  return (
    <div className={css.root}>
      <div className={css.headerPage}>
        {intl.formatMessage({ id: 'PartnerSidebar.reviews' })}
      </div>
      <div className={classNames(css.overviewClass, css.titleText)}>
        {intl.formatMessage({ id: 'ManagePartnerReviewsPage.overView' })}
      </div>
      <SummarizeReview
        foodRating={food}
        packagingRating={packaging}
        pointRating={pointRating}
        totalRating={totalRating}
      />
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
          reviewsData.map((r) => {
            return <ReviewDetailCard key={r.id} data={r} />;
          })
        )}
      </div>
    </div>
  );
};

export default ManageReviewsPage;
