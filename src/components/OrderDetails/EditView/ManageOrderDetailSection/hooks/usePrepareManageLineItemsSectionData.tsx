/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react';
import { isEmpty } from 'lodash';
import { useRouter } from 'next/router';

import { useAppSelector } from '@hooks/reduxHooks';
import { Listing } from '@utils/data';
import type { TListing, TObject } from '@utils/types';

export const usePrepareManageLineItemsSectionData = (
  currentViewDate: number | string,
  setCurrentViewDate: (date: number) => void,
) => {
  const {
    query: { timestamp },
  } = useRouter();
  const [defaultActiveKey, setDefaultActiveKey] = useState(1);
  const { planData } = useAppSelector((state) => state.OrderManagement);

  const { orderDetail = {} } = Listing(planData as TListing).getMetadata();

  const dateList = Object.entries(orderDetail)
    .reduce<number[]>((prev, [date, orderOnDate]) => {
      const { restaurant } = orderOnDate as TObject;

      return !isEmpty(restaurant?.foodList) ? prev.concat(Number(date)) : prev;
    }, [])
    .sort((x, y) => x - y);

  const indexOfTimestamp = useMemo(
    () => dateList.indexOf(Number(timestamp)),
    [timestamp],
  );

  const { restaurant = {} } = orderDetail[currentViewDate?.toString()] || {};
  const { foodList = {} } = restaurant;
  const foodOptions = Object.entries<TObject>(foodList).map(
    ([foodId, foodData]) => {
      const { foodName = '', foodPrice = 0 } = foodData || {};

      return {
        foodId,
        foodName,
        foodPrice,
      };
    },
  );

  useEffect(() => {
    if (indexOfTimestamp > -1 && dateList.length > 0) {
      setDefaultActiveKey(indexOfTimestamp + 1);
      setCurrentViewDate(dateList[indexOfTimestamp]);
    }
  }, [indexOfTimestamp, JSON.stringify(dateList)]);

  return {
    dateList,
    defaultActiveKey,
    foodOptions,
  };
};
