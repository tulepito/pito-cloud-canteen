import isEmpty from 'lodash/isEmpty';

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
