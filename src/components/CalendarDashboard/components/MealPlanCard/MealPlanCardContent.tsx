import type { Event } from 'react-big-calendar';
import { FormattedMessage } from 'react-intl';
import { shallowEqual } from 'react-redux';
import classNames from 'classnames';
import isNaN from 'lodash/isNaN';

import IconRefreshing from '@components/Icons/IconRefreshing/IconRefreshing';
import IconStar from '@components/Icons/IconStar/IconStar';
import IconTruck from '@components/Icons/IconTruck/IconTruck';
import ResponsiveImage from '@components/ResponsiveImage/ResponsiveImage';
import { calculateDistance } from '@helpers/mapHelpers';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import FoodDetailModal from '@pages/company/booker/orders/draft/[orderId]/restaurants/components/FoodDetailModal/FoodDetailModal';
import { foodSliceThunks } from '@redux/slices/foods.slice';
import type { RootState } from '@redux/store';
import { Listing } from '@src/utils/data';
import { EImageVariants } from '@utils/enums';

import css from './MealPlanCard.module.scss';

type TMealPlanCardContentProps = {
  event: Event;
  onRecommendMeal?: (date: number) => void;
  onRecommendMealInProgress?: boolean;
  restaurantAvailable?: boolean;
  onViewAllFood?: (id: string, restaurantId: string, menuId: string) => void;
  editFoodInprogress?: boolean;
  companyGeoOrigin: any;
};

const MealPlanCardContent: React.FC<TMealPlanCardContentProps> = ({
  event,
  onRecommendMeal,
  onRecommendMealInProgress,
  restaurantAvailable = true,
  onViewAllFood,
  editFoodInprogress,
  companyGeoOrigin,
}) => {
  const restaurantList = useAppSelector(
    (state) => state.Order.orderRestaurantList,
    shallowEqual,
  );

  const walkthroughStep = useAppSelector(
    (state) => state.BookerDraftOrderPage.walkthroughStep,
  );

  const restaurantListing: any = restaurantList.find(
    (restaurant) => restaurant.id.uuid === event.resource?.restaurant?.id,
  );
  const { geolocation: origin } = Listing(restaurantListing).getAttributes();

  const { totalRating = 0, totalRatingNumber = 0 } =
    Listing(restaurantListing).getMetadata();
  const dishes = event.resource?.meal?.dishes;
  const restaurantName = event.resource?.restaurant?.name;
  const restaurantCoverImage = event.resource?.restaurant?.coverImage;
  const { id, restaurant = {} } = event.resource || {};

  const foodModal = useBoolean(false);
  const fetchFoodDetailInProgress = useAppSelector(
    (state: RootState) => state.foods.fetchFoodDetailInProgress,
  );
  const selectedFood = useAppSelector(
    (state: RootState) => state.foods.foodDetail,
  );
  const dispatch = useAppDispatch();

  const handleRefreshIconClick = () => {
    if (onRecommendMealInProgress) return;
    onRecommendMeal?.(event?.start?.getTime()!);
  };

  const maxDishRows = 5;
  const isMoreThanMaxDishRows = dishes?.length > maxDishRows;
  const firstMaxDishRows = dishes?.slice(0, maxDishRows);

  const onViewAll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (editFoodInprogress) return;

    e.preventDefault();
    onViewAllFood?.(id, restaurant.id, restaurant.menuId);
  };

  const handleOpenFoodDetail = (foodId: string) => {
    foodModal.setTrue();
    dispatch(foodSliceThunks.fetchFoodDetail(foodId));
  };

  const distance = calculateDistance(companyGeoOrigin, origin);

  return (
    <div
      className={classNames(css.content, !restaurantAvailable && css.disable)}>
      <div className={css.coverImg}>
        <ResponsiveImage
          alt={`${restaurantName}`}
          image={restaurantCoverImage}
          variants={[
            EImageVariants.landscapeCrop,
            EImageVariants.landscapeCrop2x,
          ]}
        />
      </div>
      <div
        className={classNames(css.restaurant, {
          [css.walkthrough]: walkthroughStep === 1,
        })}>
        <span title={restaurantName}>{restaurantName}</span>
        <IconRefreshing
          className={css.recommendRestaurant}
          onClick={handleRefreshIconClick}
          inProgress={onRecommendMealInProgress}
          data-tour="step-2"
        />
      </div>
      <div className={css.metaSection}>
        <div className={css.metaItem}>
          <IconTruck className={css.metaItemIcon} />
          <span>{`${isNaN(distance) ? '...' : distance}km`}</span>
        </div>
        <div className={css.metaItem}>
          <IconStar className={css.littleStarIcon} />
          <span>{`${totalRating}/5 (${totalRatingNumber})`}</span>
        </div>
      </div>
      <ul className={css.foodList}>
        {!!firstMaxDishRows?.length &&
          firstMaxDishRows.map((food: { key: string; name: string }) => {
            return (
              <li
                key={food.key}
                className={css.foodListItem}
                role="button"
                onClick={() => handleOpenFoodDetail(food.key)}>
                • {food.name}
              </li>
            );
          })}
        {isMoreThanMaxDishRows && (
          <a
            className={classNames(css.viewAll, {
              [css.disabled]: editFoodInprogress,
            })}
            onClick={onViewAll}>
            <FormattedMessage id="MealPlanCard.content.viewAll" />
          </a>
        )}
      </ul>

      <FoodDetailModal
        isOpen={foodModal.value}
        food={selectedFood}
        onClose={foodModal.setFalse}
        isLoading={fetchFoodDetailInProgress}
      />
    </div>
  );
};

export default MealPlanCardContent;
