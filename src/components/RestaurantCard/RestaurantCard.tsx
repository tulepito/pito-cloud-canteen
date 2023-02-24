import Badge from '@components/Badge/Badge';
import IconBox from '@components/Icons/IconBox/IconBox';
import IconGift from '@components/Icons/IconGift/IconGift';
import IconHeart from '@components/Icons/IconHeart/IconHeart';
import IconStar from '@components/Icons/IconStar/IconStar';
import IconTruck from '@components/Icons/IconTruck/IconTruck';
import ResponsiveImage from '@components/ResponsiveImage/ResponsiveImage';
import { calculateDistance } from '@helpers/mapHelpers';
import { Listing } from '@utils/data';
import {
  CATEGORY_OPTIONS,
  EImageVariants,
  PACKAGING_OPTIONS,
} from '@utils/enums';
import classNames from 'classnames';
import React from 'react';

import css from './RestaurantCard.module.scss';

type TRestaurantCardProps = {
  className?: string;
  restaurant?: any;
  onClick?: (restaurantId: string) => void;
  companyGeoOrigin: {
    lat: number;
    lng: number;
  };
  totalRatings: any[];
};

const RestaurantCard: React.FC<TRestaurantCardProps> = ({
  className,
  onClick = () => null,
  restaurant,
  companyGeoOrigin,
  totalRatings,
}) => {
  const classes = classNames(css.root, className);
  const restaurantId = Listing(restaurant).getId();
  const { geolocation: origin } = Listing(restaurant).getAttributes();
  const { categories = [], packaging = [] } =
    Listing(restaurant).getPublicData();
  const { rating = 0 } = Listing(restaurant).getMetadata();
  const restaurantCoverImage = Listing(restaurant).getImages()[0];

  const mealStyles = categories
    .slice(0, 3)
    .map((category: string) =>
      CATEGORY_OPTIONS.find((item) => item.key === category),
    );

  const restaurantPackaging = PACKAGING_OPTIONS.find(
    (item) => item.key === packaging[0],
  )?.label;

  const totalReviewsOfRestaurant =
    totalRatings.find(
      (_restaurant) => _restaurant.restaurantId === restaurantId,
    )?.totalReviews || 0;

  const handleClickCard = () => {
    onClick(restaurantId);
  };

  return (
    <div className={classes}>
      <div className={css.bonusBadge}>
        <IconGift className={css.gift} />
        <span>x2</span>
      </div>
      <div className={css.coverImage}>
        <ResponsiveImage
          alt="card"
          image={restaurantCoverImage}
          variants={[EImageVariants.default]}
        />
      </div>
      <div className={css.header}>
        <p className={css.restaurantName} onClick={handleClickCard}>
          {Listing(restaurant).getAttributes().title}
        </p>
        <IconHeart className={css.favoriteIcon} />
      </div>
      <div className={css.nutritions}>
        {mealStyles.map((style: any) => (
          <Badge
            key={style?.key}
            className={css.badge}
            label={style?.label}
            type={style.badgeType}
          />
        ))}
      </div>

      <div className={css.footer}>
        <div className={css.footerItem}>
          <IconTruck className={css.footerItemIcon} />
          <span>{`${calculateDistance(companyGeoOrigin, origin)}km`}</span>
        </div>
        <div className={css.footerItem}>
          <IconStar className={css.footerItemIcon} />
          <span>{`${rating} (${totalReviewsOfRestaurant})`}</span>
        </div>
        <div className={css.footerItem}>
          <IconBox className={css.footerItemIcon} />
          <span>{restaurantPackaging}</span>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
