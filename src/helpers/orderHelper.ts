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
