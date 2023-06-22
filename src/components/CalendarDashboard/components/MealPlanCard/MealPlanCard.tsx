import { useMemo } from 'react';
import type { Event } from 'react-big-calendar';
import { shallowEqual } from 'react-redux';
import clone from 'lodash/clone';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { removeMealDay } from '@redux/slices/Order.slice';

import MealPlanCardContent from './MealPlanCardContent';
import MealPlanCardFooter from './MealPlanCardFooter';
import MealPlanCardHeader from './MealPlanCardHeader';

import css from './MealPlanCard.module.scss';

type TMealPlanCardProps = {
  event: Event;
  index: number;
  removeInprogress: boolean;
  onRemove?: (id: string) => void;
  resources: any;
};

const MealPlanCard: React.FC<TMealPlanCardProps> = ({
  event,
  removeInprogress,
  onRemove,
  resources,
}) => {
  const dispatch = useAppDispatch();
  const orderDetail = useAppSelector(
    (state) => state.Order.orderDetail,
    shallowEqual,
  );
  const {
    startDate,
    endDate,
    onEditFood,
    editFoodInprogress,
    onApplyOtherDays,
    onApplyOtherDaysInProgress,
    onRecommendRestaurantForSpecificDay,
    onRecommendRestaurantForSpecificDayInProgress,
    onSearchRestaurant,
    availableOrderDetailCheckList,
  } = resources;

  const availableStatus =
    availableOrderDetailCheckList?.[event?.start?.getTime()!];

  const removeEventItem =
    onRemove ||
    ((resourceId: string) => {
      const cloneOrderDetail = clone(orderDetail);
      delete cloneOrderDetail[resourceId];
      dispatch(removeMealDay(cloneOrderDetail));
    });

  const onRecommendMealInProgress = useMemo(
    () =>
      onRecommendRestaurantForSpecificDayInProgress?.(event?.start?.getTime()),
    [event?.start, onRecommendRestaurantForSpecificDayInProgress],
  );

  const onEditFoodInProgress = useMemo(
    () => editFoodInprogress?.(event?.start?.getTime()),
    [editFoodInprogress, event?.start],
  );

  return (
    <div className={css.root} data-tour="step-1">
      <MealPlanCardHeader
        event={event}
        removeEventItem={removeEventItem}
        removeInprogress={removeInprogress}
        onSearchRestaurant={onSearchRestaurant}
      />
      <MealPlanCardContent
        event={event}
        onRecommendMeal={onRecommendRestaurantForSpecificDay}
        onRecommendMealInProgress={onRecommendMealInProgress}
        restaurantAvailable={availableStatus?.isAvailable}
      />
      <MealPlanCardFooter
        event={event}
        onEditFood={onEditFood}
        editFoodInprogress={onEditFoodInProgress}
        onApplyOtherDays={onApplyOtherDays}
        startDate={startDate}
        endDate={endDate}
        onApplyOtherDaysInProgress={onApplyOtherDaysInProgress}
        availableStatus={availableStatus}
      />
    </div>
  );
};

export default MealPlanCard;
