import React from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconHeart from '@components/Icons/IconHeart/IconHeart';
import IconStar from '@components/Icons/IconStar/IconStar';
import IconTruck from '@components/Icons/IconTruck/IconTruck';
import ResponsiveImage from '@components/ResponsiveImage/ResponsiveImage';
import { EImageVariants } from '@utils/enums';

import css from './ResultDetailModal.module.scss';

type TopContentProps = {
  avatar: any;
  restaurantName: string;
  rating: string;
  distance: string;
  ratingNumber: number;
  minQuantity: number;
  onOpenReviewModal?: () => void;
};
const TopContent: React.FC<TopContentProps> = (props) => {
  const {
    avatar,
    restaurantName,
    rating,
    distance,
    onOpenReviewModal,
    minQuantity = 0,
  } = props;

  const intl = useIntl();

  return (
    <div className={css.topContent}>
      <div className={css.profileImageWrapper}>
        <ResponsiveImage
          className={css.profileImage}
          alt={restaurantName}
          image={avatar}
          variants={[EImageVariants.squareSmall, EImageVariants.squareSmall2x]}
        />
      </div>
      <div className={css.restaurantInfo}>
        <div className={css.restaurantName}>
          <span>{restaurantName}</span>
          <IconHeart className={css.iconHeart} />
        </div>
        <div className={css.moreInfo}>
          <div className={css.moreInfoItem}>
            <IconTruck className={css.moreInfoItemIcon} />
            <span>{distance}</span>
          </div>
          <div
            className={classNames(css.ratingWrapper, css.moreInfoItem)}
            onClick={onOpenReviewModal}>
            <div className={css.moreInfoItem}>
              <IconStar className={css.ratingStar} />
              {rating}
              <IconArrow direction="right" />
            </div>
          </div>

          <div className={css.moreInfoItem}>
            <span>
              {`${intl.formatMessage({
                id: 'EditPartnerFoodForm.minQuantityPerOrderLabel',
              })}: ${minQuantity}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopContent;
