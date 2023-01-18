import { EParticipantOrderStatus } from '@utils/enums';
import type { TObject } from '@utils/types';

export const isParticipantCompletedPickFood = (
  participantId: string,
  planOrderDetails: TObject,
) => {
  const orderDetailList = Object.values(planOrderDetails);

  return orderDetailList.every((orderDetailItem) => {
    const { memberOrders } = orderDetailItem;

    return (
      memberOrders[participantId].status === EParticipantOrderStatus.joined
    );
  });
};
