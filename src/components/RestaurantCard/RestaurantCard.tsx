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
import type { OrderListing } from '@src/types';
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
  hideFavoriteIcon?: boolean;
  companyGeoOrigin?: {
    lat: number;
    lng: number;
  };
  favoriteFunc?: (restaurantId: string) => void;
  favoriteInProgress?: boolean;
  alreadyFavorite?: boolean;
  foods?: TFoodInRestaurant[];
  packagePerMember?: number;
};

const RestaurantCard: React.FC<TRestaurantCardProps> = ({
  className,
  onClick = () => null,
  restaurant,
  hideFavoriteIcon,
  companyGeoOrigin,
  favoriteFunc,
  favoriteInProgress,
  alreadyFavorite,
  foods = [],
  packagePerMember,
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
  const order = useAppSelector((state) => state.Order.order) as
    | OrderListing
    | undefined;

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

  const matchedPackagePerMemberFoods = foods.filter(
    (food) => food.price === packagePerMember,
  );

  const nonMatchedPackagePerMemberFoods = foods.filter(
    (food) => food.price !== packagePerMember,
  );

  const sortedMatchedPackagePerMemberFoodsByKeyword = sortFoodsInRestaurant(
    keywords,
    matchedPackagePerMemberFoods,
  ).slice(0, 5);

  const sortedNonMatchedPackagePerMemberFoodsByKeyword = sortFoodsInRestaurant(
    keywords,
    nonMatchedPackagePerMemberFoods,
  ).slice(0, 5);

  const hasMoreThan5Foods = foods.length > 5;

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
        'hover:shadow-md transition hover:cursor-pointer !p-2',
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
          <span>{`${calculateDistance(
            companyGeoOrigin ||
              order?.attributes?.metadata?.deliveryAddress?.origin,
            origin,
          )}km`}</span>
        </div>
        <div className={css.footerItem}>
          <IconTerm className={css.footerIconTerm} />
          <span>
            {intl.formatMessage({
              id: 'RestaurantCard.safeAndCleanCertification',
            })}
          </span>
        </div>
        {!!totalRatingNumber && (
          <div className={css.footerItem}>
            <IconStar className={css.littleStarIcon} />
            <span>{`${totalRating} (${totalRatingNumber})`}</span>
          </div>
        )}
      </div>

      {restaurantPackaging && (
        <div className={css.footer}>
          <div className={css.footerRowItem}>
            <IconBox className={css.footerItemIcon} />
            <span>{restaurantPackaging}</span>
          </div>
        </div>
      )}

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

      <div className="bg-blue-50 mt-3 rounded-lg flex">
        <table className={classNames(css.tableFood, 'my-1 mx-2 flex-1')}>
          <tbody>
            {!!sortedMatchedPackagePerMemberFoodsByKeyword.length && (
              <tr>
                <td colSpan={3}>
                  <div className="text-sm font-semibold">Lựa chọn phù hợp</div>
                </td>
              </tr>
            )}

            {!!sortedMatchedPackagePerMemberFoodsByKeyword.length &&
              sortedMatchedPackagePerMemberFoodsByKeyword.map((food, index) => (
                <FoodRow
                  key={index}
                  foodName={food.foodName}
                  price={food.price}
                  minQuantity={food.minQuantity}
                  keywords={keywords}
                  highLightClass={css.highlightTitle}
                />
              ))}

            {!sortedMatchedPackagePerMemberFoodsByKeyword.length &&
              !!sortedNonMatchedPackagePerMemberFoodsByKeyword.length && (
                <tr>
                  <td colSpan={3}>
                    <div className="text-sm font-semibold">Menu tham khảo</div>
                  </td>
                </tr>
              )}
            {!sortedMatchedPackagePerMemberFoodsByKeyword.length &&
              !!sortedNonMatchedPackagePerMemberFoodsByKeyword.length &&
              sortedNonMatchedPackagePerMemberFoodsByKeyword.map(
                (food, index) => (
                  <FoodRow
                    key={index}
                    foodName={food.foodName}
                    price={food.price}
                    minQuantity={food.minQuantity}
                    keywords={keywords}
                    highLightClass={css.highlightTitle}
                  />
                ),
              )}

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
