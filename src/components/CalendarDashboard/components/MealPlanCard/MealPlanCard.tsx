import { useMemo } from 'react';
import type { Event } from 'react-big-calendar';
import { shallowEqual } from 'react-redux';
import classNames from 'classnames';
import clone from 'lodash/clone';
import omit from 'lodash/omit';

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
  const walkthroughStep = useAppSelector(
    (state) => state.BookerDraftOrderPage.walkthroughStep,
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
    shouldHideRemoveMealIcon = false,
  } = resources;

  const availableStatus =
    availableOrderDetailCheckList?.[event?.start?.getTime()!];

  const removeEventItem =
    onRemove ||
    ((resourceId: string) => {
      let cloneOrderDetail = clone(orderDetail);
      cloneOrderDetail = {
        ...cloneOrderDetail,
        [resourceId]: omit(cloneOrderDetail[resourceId], ['restaurant']),
      };

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
    <div
      className={classNames(css.root, {
        [css.disable]: event.resource.disableEditing,
        [css.walkthrough]: walkthroughStep === 0,
      })}
      data-tour="step-1">
      <MealPlanCardHeader
        event={event}
        removeEventItem={removeEventItem}
        removeInprogress={removeInprogress}
        onSearchRestaurant={onSearchRestaurant}
        shouldHideRemoveIcon={shouldHideRemoveMealIcon}
      />
      <MealPlanCardContent
        event={event}
        onRecommendMeal={onRecommendRestaurantForSpecificDay}
        onRecommendMealInProgress={onRecommendMealInProgress}
        restaurantAvailable={availableStatus?.isAvailable}
        onViewAllFood={onEditFood}
        editFoodInprogress={onEditFoodInProgress}
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
