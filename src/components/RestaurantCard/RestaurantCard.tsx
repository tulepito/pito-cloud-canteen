import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import Badge from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import IconBox from '@components/Icons/IconBox/IconBox';
import IconGift from '@components/Icons/IconGift/IconGift';
import IconHeart from '@components/Icons/IconHeart/IconHeart';
import IconStar from '@components/Icons/IconStar/IconStar';
import IconTruck from '@components/Icons/IconTruck/IconTruck';
import ResponsiveImage from '@components/ResponsiveImage/ResponsiveImage';
import { calculateDistance } from '@helpers/mapHelpers';
import { useAppSelector } from '@hooks/reduxHooks';
import { getListingImageById } from '@pages/company/booker/orders/draft/[orderId]/restaurants/helpers';
import { BadgeTypeBaseOnCategory } from '@src/utils/attributes';
import { Listing } from '@utils/data';
import { EImageVariants } from '@utils/enums';

import css from './RestaurantCard.module.scss';

type TRestaurantCardProps = {
  className?: string;
  restaurant?: any;
  onClick?: (restaurantId: string) => void;
  companyGeoOrigin?: {
    lat: number;
    lng: number;
  };
  hideFavoriteIcon?: boolean;
  favoriteFunc?: (restaurantId: string) => void;
  favoriteInProgress?: boolean;
  alreadyFavorite?: boolean;
};

const RestaurantCard: React.FC<TRestaurantCardProps> = ({
  className,
  onClick = () => null,
  restaurant,
  companyGeoOrigin,
  hideFavoriteIcon,
  favoriteFunc,
  favoriteInProgress,
  alreadyFavorite,
}) => {
  const intl = useIntl();
  const classes = classNames(css.root, className);
  const categoryOptions = useAppSelector(
    (state) => state.BookerSelectRestaurant.categories,
  );
  const packagingOptions = useAppSelector(
    (state) => state.BookerSelectRestaurant.packaging,
  );
  const restaurantId = Listing(restaurant).getId();
  const { geolocation: origin } = Listing(restaurant).getAttributes();
  const {
    categories = [],
    packaging = [],
    coverImageId,
  } = Listing(restaurant).getPublicData();
  const { totalRating = 0, totalRatingNumber = 0 } =
    Listing(restaurant).getMetadata();
  const restaurantImages = Listing(restaurant).getImages();

  const restaurantCoverImage = getListingImageById(
    coverImageId,
    restaurantImages,
  );
  const restaurantName = Listing(restaurant).getAttributes().title;

  const mealStyles = useMemo(
    () =>
      categories.slice(0, 3).map((category: string) => {
        return {
          ...categoryOptions.find((item) => {
            return Intl.Collator('vi').compare(item.key, category) === 0;
          }),
          badgeType: BadgeTypeBaseOnCategory(category),
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(categories), JSON.stringify(categoryOptions)],
  );
  const restaurantPackaging = packagingOptions.find(
    (item) => item.key === packaging[0],
  )?.label;

  const handleClickCard = () => {
    onClick(restaurantId);
  };

  const handleFavoriteClick = () => {
    if (typeof favoriteFunc === 'function') favoriteFunc(restaurantId);
  };

  return (
    <div className={classes}>
      <div>
        <div className={css.bonusBadge}>
          <IconGift className={css.gift} />
          <span>x2</span>
        </div>
        <div className={css.coverImage} onClick={handleClickCard}>
          <ResponsiveImage
            alt="card"
            image={restaurantCoverImage}
            variants={[EImageVariants.default]}
          />
        </div>
        <div className={css.header}>
          <p
            className={css.restaurantName}
            onClick={handleClickCard}
            title={restaurantName}>
            {restaurantName}
          </p>
          {!hideFavoriteIcon && <IconHeart className={css.favoriteIcon} />}
        </div>
        <div className={css.nutritions}>
          {mealStyles.map((style: any) => (
            <Badge
              key={style?.key}
              className={css.badge}
              label={style?.label}
              type={style?.badgeType}
              labelClassName={css.badgeLabel}
            />
          ))}
        </div>
      </div>

      <div className={css.footer}>
        <div className={css.footerItem}>
          <IconTruck className={css.footerItemIcon} />
          <span>{`${calculateDistance(companyGeoOrigin, origin)}km`}</span>
        </div>
        <div className={css.footerItem}>
          <IconStar className={css.littleStarIcon} />
          <span>{`${totalRating} (${totalRatingNumber})`}</span>
        </div>
        <div className={css.footerItem}>
          <IconBox className={css.footerItemIcon} />
          <span>{restaurantPackaging}</span>
        </div>
      </div>

      {favoriteFunc && (
        <Button
          className={css.favoriteBtn}
          variant="secondary"
          inProgress={favoriteInProgress}
          disabled={alreadyFavorite}
          onClick={handleFavoriteClick}>
          {intl.formatMessage({ id: 'RestaurantCard.favoriteBtn' })}
        </Button>
      )}
    </div>
  );
};

export default RestaurantCard;
