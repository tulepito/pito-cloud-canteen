import IconGift from '@components/Icons/IconGift/IconGift';
import IconHeart from '@components/Icons/IconHeart/IconHeart';
import IconStar from '@components/Icons/IconStar/IconStar';
import IconTruck from '@components/Icons/IconTruck/IconTruck';
import Image from 'next/image';
import React from 'react';

import profileImage from './profileImage.jpg';
import css from './ResultDetailModal.module.scss';

const TopContent: React.FC = () => {
  return (
    <div className={css.topContent}>
      <div className={css.profileImage}>
        <Image src={profileImage} alt="cover" />
      </div>
      <div className={css.restaurantInfo}>
        <div className={css.restaurantName}>
          <span>Nhà hàng Vua hải sản</span>
          <IconHeart className={css.iconHeart} />
        </div>
        <div className={css.moreInfo}>
          <div className={css.moreInfoItem}>
            <IconTruck className={css.moreInfoItemIcon} />
            <span>3km</span>
          </div>
          <div className={css.moreInfoItem}>
            <IconStar className={css.ratingStar} />
            <IconStar className={css.ratingStar} />
            <IconStar className={css.ratingStar} />
            <IconStar className={css.ratingStar} />
            <IconStar className={css.ratingStar} />
            <span>5 (100)</span>
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
