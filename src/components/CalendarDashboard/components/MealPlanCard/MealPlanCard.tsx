import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  removeMealDay,
  selectCalendarDate,
  selectRestaurant,
} from '@redux/slices/Order.slice';
import {
  selectRestaurantPageThunks,
  setSelectedRestaurant,
} from '@redux/slices/SelectRestaurantPage.slice';
import { Listing } from '@utils/data';
import type { TListing } from '@utils/types';
import clone from 'lodash/clone';
import { DateTime } from 'luxon';
import type { Event } from 'react-big-calendar';
import { shallowEqual } from 'react-redux';

import css from './MealPlanCard.module.scss';
import MealPlanCardContent from './MealPlanCardContent';
import MealPlanCardFooter from './MealPlanCardFooter';
import MealPlanCardHeader from './MealPlanCardHeader';

type TMealPlanCardProps = {
  event: Event;
  index: number;
  onRemove?: (id: string) => void;
  resources?: any;
};

const MealPlanCard: React.FC<TMealPlanCardProps> = ({
  event,
  onRemove,
  resources,
}) => {
  const { onPickFoodModal } = resources;
  const dispatch = useAppDispatch();
  const orderDetail = useAppSelector(
    (state) => state.Order.orderDetail,
    shallowEqual,
  );

  const order = useAppSelector((state) => state.Order.order, shallowEqual);

  const selectedDate = useAppSelector(
    (state) => state.Order.selectedCalendarDate,
  );
  // TODO: will move these things out of this component
  const fetchFoodInProgress = useAppSelector(
    (state) => state.SelectRestaurantPage.fetchFoodPending,
  );
  const fetchRestaurantsInProgress = useAppSelector(
    (state) => state.SelectRestaurantPage.fetchRestaurantsPending,
  );

  const restaurantId = event.resource?.restaurant.id;
  const dateTime = DateTime.fromJSDate(event?.start!);

  const {
    packagePerMember,
    deliveryHour,
    nutritions = [],
  } = Listing(order as TListing).getMetadata();

  const removeEventItem =
    onRemove ||
    ((resourceId: string) => {
      const cloneOrderDetail = clone(orderDetail);
      delete cloneOrderDetail[resourceId];
      dispatch(removeMealDay(cloneOrderDetail));
    });

  const onEditMeal = (date: Date) => {
    dispatch(selectCalendarDate(date));
    dispatch(selectRestaurant());
  };

  const onCustomPickFoodModalOpen = async () => {
    dispatch(selectCalendarDate(dateTime.toJSDate()));
    const { payload }: { payload: any } = await dispatch(
      selectRestaurantPageThunks.getRestaurants({
        dateTime,
        packagePerMember,
        deliveryHour,
        nutritions,
      }),
    );

    const { restaurants = [] } = payload || {};
    const selectedRestaurant = restaurants.find(
      (_restaurant: any) =>
        Listing(_restaurant.restaurantInfo).getId() === restaurantId,
    );
    dispatch(setSelectedRestaurant(selectedRestaurant?.restaurantInfo));
    await dispatch(
      selectRestaurantPageThunks.getRestaurantFood({
        menuId: Listing(selectedRestaurant?.menu).getId(),
        dateTime,
      }),
    );
    onPickFoodModal();
  };
  const onPickFoodInProgress =
    (fetchFoodInProgress || fetchRestaurantsInProgress) &&
    selectedDate?.getTime() === event.start?.getTime();
  return (
    <div className={css.root}>
      <MealPlanCardHeader event={event} removeEventItem={removeEventItem} />
      <MealPlanCardContent event={event} onEditMeal={onEditMeal} />
      <MealPlanCardFooter
        event={event}
        onPickFoodModal={onCustomPickFoodModalOpen}
        onPickFoodInProgress={onPickFoodInProgress}
      />
    </div>
  );
};

export default MealPlanCard;
