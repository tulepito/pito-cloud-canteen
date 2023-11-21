import isEmpty from 'lodash/isEmpty';

import { renderDateRange } from '@src/utils/dates';
import { EOrderType } from '@src/utils/enums';
import type { TObject } from '@utils/types';

export const isMealPlanSetupDataValid = (generalInfo: TObject) => {
  if (isEmpty(generalInfo)) {
    return true;
  }

  const {
    deliveryHour,
    startDate,
    endDate,
    memberAmount,
    displayedDurationTime,
    deliveryAddress = {},
    packagePerMember,
    deadlineDate,
    deadlineHour,
    orderType,
  } = generalInfo;
  const isGroupOrder = orderType === EOrderType.group;

  const { address, origin } = deliveryAddress;

  if (isGroupOrder) {
    return (
      !!startDate &&
      !!endDate &&
      !!deadlineDate &&
      !!memberAmount &&
      !!address &&
      !!origin &&
      !Number.isNaN(displayedDurationTime) &&
      !isEmpty(deadlineHour) &&
      !isEmpty(deliveryHour) &&
      !isEmpty(packagePerMember)
    );
  }

  return (
    !!startDate &&
    !!endDate &&
    !!memberAmount &&
    !!address &&
    !!origin &&
    !Number.isNaN(displayedDurationTime) &&
    !isEmpty(deliveryHour)
  );
};

export const prepareOrderDetailFromOldOrderDetail = ({
  orderDetail,
  startDate,
  endDate,
}: {
  orderDetail: TObject;
  startDate: number;
  endDate: number;
}) => {
  const newOrderDetail: TObject = {};
  const dateRanges = renderDateRange(startDate, endDate);
  const oldTimes = Object.keys(orderDetail);

  dateRanges.forEach((time) => {
    const strTime = time.toString();
    const currentDay = new Date(time).getDay();
    const needApplyTime = oldTimes.includes(strTime)
      ? time
      : oldTimes.find(
          (oldTime) => new Date(Number(oldTime)).getDay() === currentDay,
        );
    newOrderDetail[time] = {
      restaurant: { foodList: [] },
      ...(needApplyTime && { ...orderDetail[needApplyTime] }),
    };
  });

  return newOrderDetail;
};
