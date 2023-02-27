import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  removeMealDay,
  selectCalendarDate,
  selectRestaurant,
} from '@redux/slices/Order.slice';
import clone from 'lodash/clone';
import type { Event } from 'react-big-calendar';
import { shallowEqual } from 'react-redux';

import css from './MealPlanCard.module.scss';
import MealPlanCardContent from './MealPlanCardContent';
import MealPlanCardFooter from './MealPlanCardFooter';
import MealPlanCardHeader from './MealPlanCardHeader';

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
  const { onEditFood, editFoodInprogress } = resources;

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

  return (
    <div className={css.root}>
      <MealPlanCardHeader
        event={event}
        removeEventItem={removeEventItem}
        removeInprogress={removeInprogress}
      />
      <MealPlanCardContent event={event} onEditMeal={onEditMeal} />
      <MealPlanCardFooter
        event={event}
        onEditFood={onEditFood}
        editFoodInprogress={editFoodInprogress}
      />
    </div>
  );
};

export default MealPlanCard;
