import Badge from '@components/Badge/Badge';
import IconPlusDish from '@components/IconPlusDish/IconPlusDish';
import { LISTING } from '@utils/data';
import classNames from 'classnames';
import React from 'react';

import css from './ListingCard.module.scss';

type TListCard = {
  className?: string;
  listing?: any;
};

const ListingCard: React.FC<TListCard> = (props) => {
  const { className, listing } = props;
  const { title, description } = LISTING(listing).getAttributes();

  const classes = classNames(css.root, className);
  return (
    <div className={classes}>
      <div className={css.listingImage}>
        <img
          alt="Listing Card "
          src={
            'https://res.cloudinary.com/eventors/image/upload/f_auto/v1584529827/eventors/hero-back_lbofw9.png'
          }
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
          <span className={css.addDish}>
            <IconPlusDish />
          </span>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
