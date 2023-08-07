import classNames from 'classnames';

import Avatar from '@components/Avatar/Avatar';
import IconRatingFace from '@components/Icons/IconRatingFace/IconRatingFace';
import { User } from '@src/utils/data';
import { formatTimestamp } from '@src/utils/dates';
import type { TUser } from '@src/utils/types';

import { converRatingPointToLabel } from '../../helpers/review';

import css from './ReviewItem.module.scss';

type ReviewItemProps = {
  generalRating: number;
  detailRating: {
    food: {
      rating: number;
    };
    packaging: {
      rating: number;
      optionalOtherReview?: string;
    };
  };
  timestamp: number;
  user: TUser;
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

  const { food, packaging } = detailRating;
  const reviewerUser = User(user);

  return (
    <div className={css.container}>
      <Avatar user={user} className={css.avatar} />
      <div className={css.reviewWrapper}>
        <div className={css.reviewerName}>
          {reviewerUser.getProfile().displayName}
        </div>
        <div className={css.generalRating}>
          {converRatingPointToLabel(generalRating)}
        </div>
        <div className={css.detailRating}>
          <IconRatingFace className={css.faceIcon} rating={food.rating} />
          <div className={css.label}>Món ăn: </div>
          <div className={css.value}>
            {converRatingPointToLabel(food.rating)}
          </div>
        </div>
        <div className={css.detailRating}>
          <IconRatingFace className={css.faceIcon} rating={packaging.rating} />
          <div className={css.label}>Dụng cụ: </div>
          <div className={css.value}>
            {converRatingPointToLabel(packaging.rating)}
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
