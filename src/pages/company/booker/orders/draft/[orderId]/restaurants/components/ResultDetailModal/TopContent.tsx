import IconGift from '@components/Icons/IconGift/IconGift';
import IconHeart from '@components/Icons/IconHeart/IconHeart';
import IconStar from '@components/Icons/IconStar/IconStar';
import IconTruck from '@components/Icons/IconTruck/IconTruck';
import ResponsiveImage from '@components/ResponsiveImage/ResponsiveImage';
import { EImageVariants } from '@utils/enums';
import React from 'react';

import css from './ResultDetailModal.module.scss';

type TopContentProps = {
  avatar: any;
  restaurantName: string;
  rating: string;
  distance: string;
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
          <div className={css.moreInfoItem}>
            <IconStar className={css.ratingStar} />
            <IconStar className={css.ratingStar} />
            <IconStar className={css.ratingStar} />
            <IconStar className={css.ratingStar} />
            <IconStar className={css.ratingStar} />
            <span>{rating}</span>
          </div>
          <div className={css.moreInfoItem}>
            <IconGift className={css.moreInfoItemIcon} />
            <span>x3 điểm PITO Club</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopContent;
