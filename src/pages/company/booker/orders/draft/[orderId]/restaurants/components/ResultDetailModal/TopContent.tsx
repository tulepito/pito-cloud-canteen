import React from 'react';

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
};
const TopContent: React.FC<TopContentProps> = (props) => {
  const { avatar, restaurantName, rating, distance } = props;

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
          <div className={css.ratingWrapper}>
            <IconStar className={css.ratingStar} />
          </div>
          <div className={css.moreInfoItem}>{rating}</div>
        </div>
      </div>
    </div>
  );
};

export default TopContent;
