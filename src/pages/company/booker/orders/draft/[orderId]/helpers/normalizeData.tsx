import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';
import { DateTime } from 'luxon';

import type { TDaySession } from '@components/CalendarDashboard/helpers/types';
import { EOrderStates } from '@src/utils/enums';
import { ETransition } from '@src/utils/transaction';
import { getDaySessionFromDeliveryTime } from '@utils/dates';

export const normalizePlanDetailsToEvent = (
  planDetails: any,
  order: {
    plans: string[];
    deliveryHour: string;
    daySession: TDaySession;
    orderState: EOrderStates;
  },
  coverImageList: any,
  isEditOrder = false,
) => {
  const dateList = Object.keys(planDetails);

  const isAllDatesHaveNoRestaurants: boolean = Object.values(planDetails).every(
    ({ hasNoRestaurants = false }: any) => hasNoRestaurants,
  );

  if (isAllDatesHaveNoRestaurants) {
    return [];
  }

  const { plans = [], deliveryHour, daySession, orderState } = order || {};
  const planId = plans.length > 0 ? plans[0] : undefined;

  const isOrderInProgress = orderState === EOrderStates.inProgress;
  const isEditInProgressOrder = isEditOrder && isOrderInProgress;

  const normalizeData = compact(
    dateList.map((timestamp) => {
      const planData = planDetails[timestamp] || {};
      const { lastTransition } = planData;
      const foodIds = Object.keys(planData?.restaurant?.foodList || {});
      const foodList = foodIds.map((id) => {
        return {
          key: id,
          value: planData?.foodList?.[id]?.foodName,
          price: planData?.foodList?.[id]?.foodPrice,
        };
      });
      const isSubOrderNotAbleToEdit = [
        ETransition.OPERATOR_CANCEL_PLAN,
        ETransition.START_DELIVERY,
        ETransition.COMPLETE_DELIVERY,
      ].includes(lastTransition);

      const restaurantMaybe = {
        id: planData?.restaurant?.id,
        name: planData?.restaurant?.restaurantName,
        menuId: planData?.restaurant?.menuId,
        coverImage: coverImageList[planData?.restaurant?.id],
      };
      const isRestaurantEmpty = isEmpty(planData?.restaurant?.id);

      if (isRestaurantEmpty) {
        return null;
      }

      return {
        resource: {
          id: timestamp,
          daySession:
            daySession ||
            getDaySessionFromDeliveryTime(deliveryHour.split('-')[0]),
          isSelectedFood: !isEmpty(restaurantMaybe.id) && !isEmpty(foodList),
          restaurant: restaurantMaybe,
          meal: {
            dishes: foodList,
          },
          planId,
          disableEditing: isEditInProgressOrder && isSubOrderNotAbleToEdit,
        },
        start: DateTime.fromMillis(Number(timestamp)).startOf('day').toJSDate(),
        end: DateTime.fromMillis(Number(timestamp)).endOf('day').toJSDate(),
      };
    }),
  );

  return normalizeData;
};
