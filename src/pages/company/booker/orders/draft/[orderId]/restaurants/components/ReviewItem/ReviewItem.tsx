import { useIntl } from 'react-intl';
import classNames from 'classnames';

import Avatar from '@components/Avatar/Avatar';
import IconRatingFace from '@components/Icons/IconRatingFace/IconRatingFace';
import type { UserListing } from '@src/types';
import { formatTimestamp } from '@src/utils/dates';
import { buildFullName } from '@src/utils/emailTemplate/participantOrderPicking';

import { converRatingPointToLabel } from '../../helpers/review';

import css from './ReviewItem.module.scss';

type ReviewItemProps = {
  generalRating: number;
  detailRating?: {
    food?: {
      rating?: number;
    };
    packaging?: {
      rating?: number;
      optionalOtherReview?: string;
    };
  };
  timestamp?: number;
  user: UserListing;
  foodName?: string;
  detailTextRating?: string;
  reviewAt?: Date;
};

const ReviewItem: React.FC<ReviewItemProps> = (props) => {
  const {
    generalRating,
    detailRating,
    user,
    timestamp,
    foodName,
    detailTextRating,
  } = props;
  const intl = useIntl();

  const { food, packaging } = detailRating || {};

  return (
    <div className={css.container}>
      <Avatar user={user} className={css.avatar} />
      <div className={css.reviewWrapper}>
        <div className={css.reviewerName}>
          {buildFullName(
            user.attributes?.profile?.firstName,
            user.attributes?.profile?.lastName,
            {
              compareToGetLongerWith: user.attributes?.profile?.displayName,
            },
          )}
        </div>
        <div className={css.generalRating}>
          {converRatingPointToLabel(generalRating)}
        </div>
        <div className={css.detailRating}>
          <IconRatingFace className={css.faceIcon} rating={food?.rating || 0} />
          <div className={css.label}>
            {intl.formatMessage({ id: 'AddOrderForm.foodIdField.placeholder' })}
            :{' '}
          </div>
          <div className={css.value}>
            {converRatingPointToLabel(food?.rating || 0)}
          </div>
        </div>
        <div className={css.detailRating}>
          <IconRatingFace
            className={css.faceIcon}
            rating={packaging?.rating || 0}
          />
          <div className={css.label}>
            {intl.formatMessage({
              id: 'ManagePartnerReviewsPage.packageTitle',
            })}
            :{' '}
          </div>
          <div className={css.value}>
            {converRatingPointToLabel(packaging?.rating || 0)}
          </div>
        </div>
        {packaging?.optionalOtherReview && (
          <div className={css.textReview}>{packaging?.optionalOtherReview}</div>
        )}
        {detailTextRating && (
          <div className={classNames(css.textReview, css.detailTextRating)}>
            {detailTextRating}
          </div>
        )}
        {foodName && (
          <div className={classNames(css.textReview, css.foodName)}>
            Đã đặt món: <span>{foodName} •</span>{' '}
            {formatTimestamp(timestamp, 'dd/MM/yyyy')}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewItem;
