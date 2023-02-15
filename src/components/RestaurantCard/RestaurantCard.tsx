import Badge, { EBadgeType } from '@components/Badge/Badge';
import IconHeart from '@components/Icons/IconHeart/IconHeart';
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
      <div className={css.coverImage}>
        <Image src={coverImg} alt="card" />
      </div>
      <div className={css.header}>
        <p className={css.restaurantName}>Nhà hàng Vua Hải Sản</p>
        <IconHeart className={css.iconHeart} />
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
        <div className={css.footerItem}></div>
      </div>
    </div>
  );
};

export default RestaurantCard;
