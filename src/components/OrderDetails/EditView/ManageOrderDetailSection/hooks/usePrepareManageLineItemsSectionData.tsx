/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo } from 'react';
import { isEmpty } from 'lodash';

import { useAppSelector } from '@hooks/reduxHooks';
import { EOrderStates } from '@src/utils/enums';
import { ETransition } from '@src/utils/transaction';
import { Listing } from '@utils/data';
import type { TListing, TObject } from '@utils/types';

export const usePrepareManageLineItemsSectionData = (
  currentViewDate: number | string,
  setCurrentViewDate: (date: number) => void,
) => {
  const { planData, orderData } = useAppSelector(
    (state) => state.OrderManagement,
  );

  const { orderStateHistory = [] } = Listing(
    orderData as TListing,
  ).getMetadata();

  const isOrderAlreadyInProgress =
    orderStateHistory.findIndex(
      (_state: { state: string; updatedAt: number }) =>
        _state.state === EOrderStates.inProgress,
    ) !== -1;

  const { orderDetail = {} } = Listing(planData as TListing).getMetadata();

  const dateList = Object.entries(orderDetail)
    .reduce<number[]>((prev, [date, orderOnDate]) => {
      const { restaurant, lastTransition } = orderOnDate as TObject;

      const isSubOrderNotAbleToEdit = [
        ETransition.OPERATOR_CANCEL_PLAN,
        ETransition.START_DELIVERY,
        ETransition.COMPLETE_DELIVERY,
      ].includes(lastTransition!);

      return !isEmpty(restaurant?.foodList) &&
        !(isOrderAlreadyInProgress && isSubOrderNotAbleToEdit)
        ? prev.concat(Number(date))
        : prev;
    }, [])
    .sort((x, y) => x - y);

  const indexOfTimestamp = useMemo(
    () => dateList.indexOf(Number(currentViewDate)),
    [currentViewDate, JSON.stringify(dateList)],
  );

  const { restaurant = {} } = orderDetail[currentViewDate?.toString()] || {};
  const { foodList = {} } = restaurant;
  const foodOptions = Object.entries<TObject>(foodList).map(
    ([foodId, foodData]) => {
      const {
        foodName = '',
        foodPrice = 0,
        numberOfMainDishes = 2,
      } = foodData || {};

      return {
        foodId,
        foodName,
        foodPrice,
        numberOfMainDishes,
      };
    },
  );

  useEffect(() => {
    if (!isEmpty(dateList)) {
      if (indexOfTimestamp <= 0) {
        setCurrentViewDate(dateList[0]);
      } else {
        setCurrentViewDate(dateList[indexOfTimestamp]);
      }
    }
  }, [indexOfTimestamp, JSON.stringify(dateList)]);

  return {
    dateList,
    foodOptions,
  };
};
