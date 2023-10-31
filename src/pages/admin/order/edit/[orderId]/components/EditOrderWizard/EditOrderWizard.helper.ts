import isEmpty from 'lodash/isEmpty';

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
  } = generalInfo;

  const { address, origin } = deliveryAddress;

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
};
