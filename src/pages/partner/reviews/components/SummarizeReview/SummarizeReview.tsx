import { useIntl } from 'react-intl';
import classNames from 'classnames';

import IconCricleStar from '@components/Icons/IconCricleStar/IconCricleStar';
import IconUser from '@components/Icons/IconUser/IconUser';

import css from './SummarizeReview.module.scss';

type TSummarizeReviewProps = {
  averageFoodRating: number;
  averagePackagingRating: number;
  totalNumberOfReivews: number;
  averageTotalRating: number;
};

const SummarizeReview: React.FC<TSummarizeReviewProps> = ({
  averageFoodRating,
  averagePackagingRating,
  totalNumberOfReivews,
  averageTotalRating,
}) => {
  const intl = useIntl();

  const calculateRatingPercent = (rating: number) => {
    return `${(rating / 5) * 100}%`;
  };

  return (
    <div className={css.summarizeContainer}>
      <div className={css.summarizeScoreContainer}>
        <div
          className={classNames(
            css.summarizeItemContainer,
            css.summarizeValueContainer,
          )}>
          <div className={css.summarizeLable}>
            <IconUser variant="multiUser" />
            <span className={css.summarizeTitle}>
              {intl.formatMessage({
                id: 'ManagePartnerReviewsPage.totalReview',
              })}
            </span>
          </div>
          <div className={css.summarizeValue}>{totalNumberOfReivews}</div>
        </div>
        <div
          className={classNames(
            css.summarizeItemContainer,
            css.summarizeValueContainer,
          )}>
          <div className={css.summarizeLable}>
            <IconCricleStar />
            <span>
              {intl.formatMessage({
                id: 'ManagePartnerReviewsPage.totalPoint',
              })}
            </span>
          </div>
          <div className={css.summarizeValue}>{averageTotalRating}</div>
        </div>
      </div>
      <div
        className={classNames(
          css.summarizeItemContainer,
          css.detailRatingContainer,
        )}>
        <div className={css.detailRatingRow}>
          <span className={classNames(css.scenarioLabel, css.ratingText)}>
            {intl.formatMessage({ id: 'ManagePartnerReviewsPage.foodTitle' })}:
          </span>
          <div className={css.ratingBar}>
            <div
              style={{
                width: calculateRatingPercent(averageFoodRating || 0),
              }}
              className={css.activeBar}></div>
          </div>
          <span className={classNames(css.ratingPoint, css.ratingText)}>{`${
            averageFoodRating || 0
          }/5`}</span>
        </div>
        <div className={css.detailRatingRow}>
          <span className={classNames(css.scenarioLabel, css.ratingText)}>
            {intl.formatMessage({
              id: 'ManagePartnerReviewsPage.packageTitle',
            })}
            :
          </span>
          <div className={css.ratingBar}>
            <div
              style={{
                width: calculateRatingPercent(averagePackagingRating || 0),
              }}
              className={css.activeBar}></div>
          </div>
          <span className={classNames(css.ratingPoint, css.ratingText)}>{`${
            averagePackagingRating || 0
          }/5`}</span>
        </div>
      </div>
    </div>
  );
};

export default SummarizeReview;
