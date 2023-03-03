import React from 'react';
import classNames from 'classnames';

import Badge, { EBadgeType } from '@components/Badge/Badge';
import IconCheckmarkWithCircle from '@components/Icons/IconCheckmark/IconCheckmarkWithCircle';
import IconPlusCircle from '@components/Icons/IconPlusCircle/IconPlusCircle';
import ResponsiveImage from '@components/ResponsiveImage/ResponsiveImage';
import { addCommas } from '@helpers/format';
import { Listing } from '@utils/data';
import { EImageVariants } from '@utils/enums';
import type { TListing } from '@utils/types';

import css from './FoodCard.module.scss';

type TFoodCardProps = {
  className?: string;
  isSelected?: boolean;
  food?: TListing;
  onClick?: (foodId: string) => void;
  onSelect?: (foodId: string) => void;
  onRemove?: (foodId: string) => void;
  hideSelection?: boolean;
};

const FoodCard: React.FC<TFoodCardProps> = ({
  className,
  isSelected = false,
  food,
  onSelect = () => null,
  onRemove = () => null,
  onClick = () => null,
  hideSelection = false,
}) => {
  const classes = classNames(css.root, className);

  const handleSelect = () => {
    onSelect(`${Listing(food!).getId()}`);
  };

  const handleClickFood = () => {
    onClick(`${Listing(food!).getId()}`);
  };

  const handleRemove = () => {
    onRemove(Listing(food!).getId());
  };
  const selection = isSelected ? (
    <IconCheckmarkWithCircle onClick={handleRemove} className={css.checkIcon} />
  ) : (
    <IconPlusCircle onClick={handleSelect} className={css.plusIcon} />
  );
  return (
    <div className={classes}>
      <div className={css.coverImage} onClick={handleClickFood}>
        <ResponsiveImage
          alt="food"
          image={Listing(food!).getImages()[0]}
          variants={[EImageVariants.default]}
        />
      </div>
      <div className={css.contentContainer}>
        <div className={css.title} onClick={handleClickFood}>
          {Listing(food!).getAttributes().title}
        </div>
        <div className={css.badges}>
          <Badge className={css.badge} type={EBadgeType.info} label="Keto" />
        </div>
        <div className={css.price}>{`${addCommas(
          Listing(food!).getAttributes()?.price?.amount,
        )} ₫ / Phần`}</div>
        <div className={css.vatIncludedNotice}>(đã bao gồm VAT)</div>
      </div>
      {!hideSelection && selection}
    </div>
  );
};

export default FoodCard;
