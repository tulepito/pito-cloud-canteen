import Badge, { EBadgeType } from '@components/Badge/Badge';
import IconBox from '@components/Icons/IconBox/IconBox';
import IconGift from '@components/Icons/IconGift/IconGift';
import IconHeart from '@components/Icons/IconHeart/IconHeart';
import IconStar from '@components/Icons/IconStar/IconStar';
import IconTruck from '@components/Icons/IconTruck/IconTruck';
import classNames from 'classnames';
import Image from 'next/image';
import React from 'react';

import css from './RestaurantCard.module.scss';
import coverImg from './restaurantPlaceholder.png';

type TRestaurantCardProps = {
  className?: string;
  restaurant?: any;
};

const RestaurantCard: React.FC<TRestaurantCardProps> = ({ className }) => {
  const classes = classNames(css.root, className);

  return (
    <div className={classes}>
      <div className={css.bonusBadge}>
        <IconGift className={css.gift} />
        <span>x2</span>
      </div>
      <div className={css.coverImage}>
        <Image src={coverImg} alt="card" />
      </div>
      <div className={css.header}>
        <p className={css.restaurantName}>Nhà hàng Vua Hải Sản</p>
        <IconHeart className={css.favoriteIcon} />
      </div>
      <div className={css.nutritions}>
        <Badge
          className={css.badge}
          label="Keto"
          type={EBadgeType.PROCESSING}
        />
        <Badge className={css.badge} label="Halal" type={EBadgeType.WARNING} />
      </div>
      <div className={css.footer}>
        <div className={css.footerItem}>
          <IconTruck className={css.footerItemIcon} />
          <span>3km</span>
        </div>
        <div className={css.footerItem}>
          <IconStar className={css.footerItemIcon} />
          <span>4.5 (100)</span>
        </div>
        <div className={css.footerItem}>
          <IconBox className={css.footerItemIcon} />
          <span>Hộp giấy</span>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
