import type { Event } from 'react-big-calendar';
import { FormattedMessage } from 'react-intl';
import { shallowEqual } from 'react-redux';
import classNames from 'classnames';
import { isEmpty } from 'lodash';
import isNaN from 'lodash/isNaN';
import { useRouter } from 'next/router';

import IconRefreshing from '@components/Icons/IconRefreshing/IconRefreshing';
import IconStar from '@components/Icons/IconStar/IconStar';
import IconTruck from '@components/Icons/IconTruck/IconTruck';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import ResponsiveImage from '@components/ResponsiveImage/ResponsiveImage';
import Tooltip from '@components/Tooltip/Tooltip';
import { calculateDistance } from '@helpers/mapHelpers';
import Tracker from '@helpers/tracker';
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
};

const MealPlanCardContent: React.FC<TMealPlanCardContentProps> = ({
  event,
  onRecommendMeal,
  onRecommendMealInProgress,
  restaurantAvailable = true,
  onViewAllFood,
  editFoodInprogress,
}) => {
  const restaurantList = useAppSelector(
    (state) => state.Order.orderRestaurantList,
    shallowEqual,
  );

  const router = useRouter();
  const walkthroughStep = useAppSelector(
    (state) => state.BookerDraftOrderPage.walkthroughStep,
  );

  const restaurantListing: any = restaurantList.find(
    (restaurant) => restaurant.id.uuid === event.resource?.restaurant?.id,
  );
  const { geolocation: restaurantLocation } =
    Listing(restaurantListing).getAttributes();

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
    Tracker.track('booker:order:randomly-suggest-menus', {
      orderId: String(router.query.orderId),
      planId: String(event.resource?.planId),
      timestamp: Number(event?.resource?.id),
    });
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

  const orderDetails = useAppSelector((state) => state.Order.order);

  const orderLocation =
    orderDetails?.attributes?.metadata?.deliveryAddress?.origin;

  const distance = calculateDistance(restaurantLocation, orderLocation);

  return (
    <div
      className={classNames(css.content, !restaurantAvailable && css.disable)}>
      <div className={css.coverImg}>
        <RenderWhen condition={!isEmpty(restaurantCoverImage)}>
          <ResponsiveImage
            alt={`${restaurantName}`}
            image={restaurantCoverImage}
            variants={[
              EImageVariants.landscapeCrop,
              EImageVariants.landscapeCrop2x,
            ]}
          />
        </RenderWhen>
      </div>
      <div
        className={classNames(css.restaurant, {
          [css.walkthrough]: walkthroughStep === 1,
        })}>
        <span title={restaurantName}>{restaurantName}</span>
        <Tooltip
          placement="top"
          overlayInnerStyle={{
            padding: '8px 12px',
            maxWidth: 250,
          }}
          tooltipContent={
            <div>
              <div className={css.stepTitle}>Tự động đổi menu khác</div>
              <div className={css.stepContent}>
                Bấm để <b>đổi thực đơn</b> khác
              </div>
            </div>
          }>
          <IconRefreshing
            className={css.recommendRestaurant}
            onClick={handleRefreshIconClick}
            inProgress={onRecommendMealInProgress}
            data-tour="step-2"
          />
        </Tooltip>
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
                title={food.name}
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
