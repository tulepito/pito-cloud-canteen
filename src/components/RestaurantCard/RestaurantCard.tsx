import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import FoodRow from '@components/FoodRow/FoodRow';
import IconBox from '@components/Icons/IconBox/IconBox';
import IconHeart from '@components/Icons/IconHeart/IconHeart';
import IconMoneyReceive from '@components/Icons/IconMoneyReceive/IconMoneyReceive';
import IconStar from '@components/Icons/IconStar/IconStar';
import IconTerm from '@components/Icons/IconTerm/IconTerm';
import IconTruck from '@components/Icons/IconTruck/IconTruck';
import ResponsiveImage from '@components/ResponsiveImage/ResponsiveImage';
import { sortFoodsInRestaurant } from '@helpers/food';
import { calculateDistance } from '@helpers/mapHelpers';
import { searchKeywords } from '@helpers/titleHelper';
import { useAppSelector } from '@hooks/reduxHooks';
import { getListingImageById } from '@pages/company/booker/orders/draft/[orderId]/restaurants/helpers';
import type { TFoodInRestaurant } from '@src/types/bookerSelectRestaurant';
import { BadgeTypeBaseOnCategory } from '@src/utils/attributes';
import type { TKeyValue } from '@src/utils/types';
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
  foods?: TFoodInRestaurant[];
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
  foods = [],
}) => {
  const intl = useIntl();
  const classes = classNames(css.root, className);
  const categoryOptions = useAppSelector(
    (state) => state.SystemAttributes.categories,
  );

  const router = useRouter();
  const { keywords } = router.query;

  const packagingOptions = useAppSelector(
    (state) => state.SystemAttributes.packaging,
  );
  const restaurantListing = Listing(restaurant);
  const restaurantId = restaurantListing.getId();
  const { geolocation: origin } = restaurantListing.getAttributes();

  const {
    categories = [],
    packaging = [],
    coverImageId,
    minQuantity,
  } = restaurantListing.getPublicData();
  const { totalRating = 0, totalRatingNumber = 0 } =
    restaurantListing.getMetadata();
  const restaurantImages = restaurantListing.getImages();

  const restaurantCoverImage = getListingImageById(
    coverImageId,
    restaurantImages,
  );
  const restaurantName = restaurantListing.getAttributes().title;

  const restaurantNameHighlight = useMemo<
    | string
    | {
        text: string;
        isMatchKeywords: boolean;
      }[]
  >(
    () =>
      keywords ? searchKeywords(restaurantName, keywords) : restaurantName,
    [keywords, restaurantName],
  );

  const restaurantPackaging = packagingOptions.find(
    (item: TKeyValue) => item.key === packaging[0],
  )?.label;

  const handleClickCard = () => {
    onClick(restaurantId);
  };

  const handleFavoriteClick = () => {
    if (typeof favoriteFunc === 'function') favoriteFunc(restaurantId);
  };

  const sortedFoods = sortFoodsInRestaurant(keywords, foods);

  const hasMoreThan5Foods = sortedFoods.length > 5;
  const first5Foods = sortedFoods.slice(0, 5);

  const mealStyles = useMemo(
    () =>
      categories.slice(0, 3).map((category: string) => {
        return {
          ...categoryOptions.find((item: TKeyValue) => {
            return Intl.Collator('vi').compare(item.key, category) === 0;
          }),
          badgeType: BadgeTypeBaseOnCategory(category),
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(categories), JSON.stringify(categoryOptions)],
  );

  const nutrionText = mealStyles
    .map((style: { label: string }) => style.label)
    .join(', ');

  return (
    <div
      className={classNames(
        classes,
        'hover:shadow-md transition hover:cursor-pointer',
      )}
      onClick={handleClickCard}>
      <div>
        <div className={css.coverImage}>
          <ResponsiveImage
            alt="card"
            image={restaurantCoverImage}
            variants={[EImageVariants.default]}
          />
          {mealStyles.length > 0 && (
            <div className={css.nutritions}>{nutrionText}</div>
          )}
        </div>
        <div className={css.header}>
          <p className={css.restaurantName} title={restaurantName}>
            {Array.isArray(restaurantNameHighlight)
              ? restaurantNameHighlight.map((k) => (
                  <span
                    key={k.text}
                    className={k.isMatchKeywords ? css.highlightTitle : ''}>
                    {k.text}{' '}
                  </span>
                ))
              : restaurantNameHighlight}
          </p>
          {!hideFavoriteIcon && <IconHeart className={css.favoriteIcon} />}
        </div>
      </div>

      <div className={css.footer}>
        <div className={css.footerItem}>
          <IconTruck className={css.footerItemIcon} />
          <span>{`${calculateDistance(companyGeoOrigin, origin)}km`}</span>
        </div>
        <div className={css.footerItem}>
          <IconTerm className={css.footerIconTerm} />
          <span>
            {intl.formatMessage({
              id: 'RestaurantCard.safeAndCleanCertification',
            })}
          </span>
        </div>
        <div className={css.footerItem}>
          <IconStar className={css.littleStarIcon} />
          <span>{`${totalRating} (${totalRatingNumber})`}</span>
        </div>
      </div>

      <div className={css.footer}>
        <div className={css.footerRowItem}>
          <IconBox className={css.footerItemIcon} />
          <span>{restaurantPackaging}</span>
        </div>
      </div>

      <div className={css.footer}>
        <div className={css.footerRowItem}>
          <IconMoneyReceive className={css.footerItemIcon} />
          <span>
            {intl.formatMessage(
              {
                id: 'RestaurantCard.minQuantityValuePerOrder',
              },
              { minQuantity },
            )}
          </span>
        </div>
      </div>

      <table className={css.tableFood}>
        <tbody>
          {first5Foods.map((food, index) => (
            <FoodRow
              key={index}
              foodName={food.foodName}
              price={food.price}
              minQuantity={food.minQuantity}
              keywords={keywords}
              highLightClass={css.highlightTitle}
            />
          ))}
          {hasMoreThan5Foods && (
            <tr>
              <td colSpan={3}>
                <button
                  className={classNames(
                    css.inlineTextButtonRoot,
                    'text-xs hover:underline hover:cursor-pointer',
                  )}>
                  {intl.formatMessage({
                    id: 'RestaurantCard.viewDetailText',
                  })}
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
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
