import Badge from '@components/Badge/Badge';
import IconCheckmark from '@components/IconCheckmark/IconCheckmark';
import IconPlusDish from '@components/IconPlusDish/IconPlusDish';
import IconCheckmarkWithCircle from '@components/Icons/IconCheckmarkWithCircle';
import { useAppDispatch } from '@hooks/reduxHooks';
import { shopingCartThunks } from '@redux/slices/shopingCart.slice';
import { LISTING } from '@utils/data';
import classNames from 'classnames';
import Image from 'next/image';
import React from 'react';

import css from './ListingCard.module.scss';

type TListCard = {
  className?: string;
  listing: any;
  planId: string;
  dayId: string;
  isSelected?: boolean;
  selectDisabled?: boolean;
};

const ListingCard: React.FC<TListCard> = ({
  className,
  listing,
  planId,
  dayId,
  isSelected,
  selectDisabled,
}) => {
  const mealId = listing?.id?.uuid;
  const { title, description } = LISTING(listing).getAttributes();
  const dispatch = useAppDispatch();

  const handleAddToCard = () => {
    if (!selectDisabled) {
      dispatch(shopingCartThunks.addToCart({ planId, dayId, mealId }));
    }
  };

  const classes = classNames(css.root, className);
  return (
    <div className={classes}>
      <div className={css.listingImage}>
        <Image
          alt="Listing Card "
          src={
            'https://res.cloudinary.com/eventors/image/upload/f_auto/v1584529827/eventors/hero-back_lbofw9.png'
          }
          fill={true}
        />
      </div>
      <div className={css.listingCardContent}>
        <div className={css.listingCardInfo}>
          <h6 className={css.title}>{title}</h6>
          <div className={css.categories}>
            <Badge label="Keto" type="processing" />
          </div>
          <p className={css.description}>{description}</p>
        </div>
        <div className={css.listingCardFooter}>
          <p className={css.allergiesLabel}>Có hải sản</p>
          {isSelected ? (
            <span className={css.removeDish}>
              <IconCheckmarkWithCircle />
            </span>
          ) : (
            <span
              className={classNames(css.addDish, {
                [css.selectDisabled]: selectDisabled,
              })}
              onClick={handleAddToCard}>
              <IconPlusDish />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
