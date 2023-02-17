import Badge, { EBadgeType } from '@components/Badge/Badge';
import IconCheckmarkWithCircle from '@components/Icons/IconCheckmark/IconCheckmarkWithCircle';
import IconPlusCircle from '@components/Icons/IconPlusCircle/IconPlusCircle';
import classNames from 'classnames';
import Image from 'next/image';
import React from 'react';

import coverImage from './defaultFood.png';
import css from './FoodCard.module.scss';

type TFoodCardProps = {
  className?: string;
  isSelected?: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
};

const FoodCard: React.FC<TFoodCardProps> = ({
  className,
  isSelected = false,
  onSelect = () => null,
  onRemove = () => null,
}) => {
  const classes = classNames(css.root, className);

  return (
    <div className={classes}>
      <div className={css.coverImage}>
        <Image src={coverImage} alt="cover" />
      </div>
      <div className={css.contentContainer}>
        <div className={css.title}>Hàu sữa nướng phô mai</div>
        <div className={css.badges}>
          <Badge
            className={css.badge}
            type={EBadgeType.PROCESSING}
            label="Keto"
          />
        </div>
        <div className={css.price}>30,000 ₫ / Phần</div>
        <div className={css.vatIncludedNotice}>(đã bao gồm VAT)</div>
      </div>
      {isSelected ? (
        <IconCheckmarkWithCircle onClick={onRemove} className={css.checkIcon} />
      ) : (
        <IconPlusCircle onClick={onSelect} className={css.plusIcon} />
      )}
    </div>
  );
};

export default FoodCard;
