import {
  AFTERNOON_SESSION,
  DINNER_SESSION,
  EVENING_SESSION,
  MORNING_SESSION,
} from '@components/CalendarDashboard/helpers/constant';
import { LISTING } from '@utils/data';
import { EParticipantOrderStatus } from '@utils/enums';
import type { TListing } from '@utils/types';

export const isJoinedPlan = (
  foodId: string,
  status: EParticipantOrderStatus,
) => {
  return foodId !== '' && status === EParticipantOrderStatus.joined;
};

export const isOverDeadline = (order: TListing) => {
  const currentTime = new Date().getTime();
  const { deadlineDate = 0 } = LISTING(order).getMetadata();

  return currentTime >= deadlineDate;
};

export const deliveryDaySessionAdapter = (daySession: string) => {
  switch (daySession) {
    case MORNING_SESSION:
      return 'breakfast';
    case DINNER_SESSION:
      return 'dinner';
    case AFTERNOON_SESSION:
      return 'lunch';
    case EVENING_SESSION:
      return 'brunch';
    default:
      break;
  }
};
