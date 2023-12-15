import { useIntl } from 'react-intl';
import classNames from 'classnames';

import IconCricleStar from '@components/Icons/IconCricleStar/IconCricleStar';
import IconUser from '@components/Icons/IconUser/IconUser';

import css from './SummarizeReview.module.scss';

type TSummarizeReviewProps = {
  foodRating: number;
  packagingRating: number;
  totalRating: number;
  pointRating: number;
};

const SummarizeReview: React.FC<TSummarizeReviewProps> = ({
  foodRating,
  packagingRating,
  totalRating,
  pointRating,
}) => {
  const intl = useIntl();

  const calculateRatingPercent = (rating: number) => {
    return `${(rating / 5) * 100}%`;
  };

  return (
    <div className={css.summarizeContainer}>
      <div
        className={classNames(
          css.summarizeItemContainer,
          css.summarizeValueContainer,
        )}>
        <div className={css.summarizeLable}>
          <IconUser variant="multiUser" />
          <span className={css.summarizeTitle}>
            {intl.formatMessage({ id: 'ManagePartnerReviewsPage.totalReview' })}
          </span>
        </div>
        <div className={css.summarizeValue}>{totalRating}</div>
      </div>
      <div
        className={classNames(
          css.summarizeItemContainer,
          css.summarizeValueContainer,
        )}>
        <div className={css.summarizeLable}>
          <IconCricleStar />
          <span>
            {intl.formatMessage({ id: 'ManagePartnerReviewsPage.totalPoint' })}
          </span>
        </div>
        <div className={css.summarizeValue}>{pointRating}</div>
      </div>
      <div
        className={classNames(
          css.summarizeItemContainer,
          css.detailRatingContainer,
        )}>
        <div className={css.detailRatingRow}>
          <span className={classNames(css.scenarioLabel, css.rattingText)}>
            {intl.formatMessage({ id: 'ManagePartnerReviewsPage.foodTitle' })}:
          </span>
          <div className={css.ratingBar}>
            <div
              style={{ width: calculateRatingPercent(foodRating || 0) }}
              className={css.activeBar}></div>
          </div>
          <span className={classNames(css.ratingPoint, css.rattingText)}>{`${
            foodRating || 0
          }/5`}</span>
        </div>
        <div className={css.detailRatingRow}>
          <span className={classNames(css.scenarioLabel, css.rattingText)}>
            {intl.formatMessage({
              id: 'ManagePartnerReviewsPage.packageTitle',
            })}
            :
          </span>
          <div className={css.ratingBar}>
            <div
              style={{
                width: calculateRatingPercent(packagingRating || 0),
              }}
              className={css.activeBar}></div>
          </div>
          <span className={classNames(css.ratingPoint, css.rattingText)}>{`${
            packagingRating || 0
          }/5`}</span>
        </div>
      </div>
    </div>
  );
};

export default SummarizeReview;
