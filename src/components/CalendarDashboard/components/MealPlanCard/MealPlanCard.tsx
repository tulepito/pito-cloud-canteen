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
    onEditFood,
    editFoodInprogress,
    onApplyOtherDays,
    dayInWeek,
    onApplyOtherDaysInProgress,
    onRecommendRestaurantForSpecificDay,
    onRecommendRestaurantForSpecificDayInProgress,
    onSearchRestaurant,
  } = resources;

  const removeEventItem =
    onRemove ||
    ((resourceId: string) => {
      const cloneOrderDetail = clone(orderDetail);
      delete cloneOrderDetail[resourceId];
      dispatch(removeMealDay(cloneOrderDetail));
    });

  const onRecommendMealInProgress =
    onRecommendRestaurantForSpecificDayInProgress?.(event?.start?.getTime());

  return (
    <div className={css.root}>
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
      />
      <MealPlanCardFooter
        event={event}
        onEditFood={onEditFood}
        editFoodInprogress={editFoodInprogress}
        onApplyOtherDays={onApplyOtherDays}
        dayInWeek={dayInWeek}
        onApplyOtherDaysInProgress={onApplyOtherDaysInProgress}
      />
    </div>
  );
};

export default MealPlanCard;
