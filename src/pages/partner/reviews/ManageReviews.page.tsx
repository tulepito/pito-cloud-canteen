import React from 'react';
import { useIntl } from 'react-intl';

import IconCricleStar from '@components/Icons/IconCricleStar/IconCricleStar';
import IconUser from '@components/Icons/IconUser/IconUser';

import css from './ManageReviews.module.scss';

const ManageReviewsPage = () => {
  const intl = useIntl();

  const calculateRatingPercent = (rating: number) => {
    return `${(rating / 5) * 100}%`;
  };

  const food = 4.2;
  const packaging = 4.2;

  return (
    <div className={css.root}>
      <h1>{intl.formatMessage({ id: 'PartnerSidebar.reviews' })}</h1>
      <h2 className={css.overviewClass}>
        {intl.formatMessage({ id: 'ManagePartnerReviewsPage.overView' })}
      </h2>
      <div className={css.summarizeContainer}>
        <div className={css.summarizeItemContainer}>
          <IconUser variant="multiUser" />
          <span>Tổng đánh giá</span>
          <h2>800</h2>
        </div>
        <div className={css.summarizeItemContainer}>
          <IconCricleStar />
          <span>Điểm tổng</span>
          <h2>4.8</h2>
        </div>
        <div className={css.summarizeItemRateContainer}>
          <div className={css.detailRatingContainer}>
            <div className={css.detailRatingRow}>
              <span className={css.scenarioLabel}>Món ăn:</span>
              <div className={css.ratingBar}>
                <div
                  style={{ width: calculateRatingPercent(food || 0) }}
                  className={css.activeBar}></div>
              </div>
              <span className={css.ratingPoint}>{`${food || 0}/5`}</span>
            </div>
            <div className={css.detailRatingRow}>
              <span className={css.scenarioLabel}>Dụng cụ:</span>
              <div className={css.ratingBar}>
                <div
                  style={{
                    width: calculateRatingPercent(packaging || 0),
                  }}
                  className={css.activeBar}></div>
              </div>
              <span className={css.ratingPoint}>{`${packaging || 0}/5`}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageReviewsPage;
