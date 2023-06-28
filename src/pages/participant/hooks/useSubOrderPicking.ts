import { useState } from 'react';
import type { Event } from 'react-big-calendar';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { participantOrderManagementThunks } from '@redux/slices/ParticipantOrderManagementPage.slice';
import { CurrentUser } from '@src/utils/data';

const useSubOrderPicking = () => {
  const dispatch = useAppDispatch();
  const subOrderDetailModalControl = useBoolean();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const currentUserGetter = CurrentUser(currentUser!);
  const currentUserId = currentUserGetter.getId();
  const updateOrderInProgress = useAppSelector(
    (state) => state.ParticipantOrderManagementPage.updateOrderInProgress,
  );

  const updateSubOrderInProgress = useAppSelector(
    (state) => state.ParticipantOrderList.updateSubOrderInProgress,
  );

  const addSubOrderDocumentToFirebaseInProgress = useAppSelector(
    (state) =>
      state.ParticipantOrderList.addSubOrderDocumentToFirebaseInProgress,
  );

  const participantPostRatingInProgress = useAppSelector(
    (state) => state.ParticipantOrderList.participantPostRatingInProgress,
  );

  const onRejectSelectDish = (params: any) => {
    const { orderId, orderDay, planId } = params;
    const payload = {
      updateValues: {
        orderId,
        orderDay,
        planId,
        memberOrders: {
          [currentUserId]: {
            status: 'notJoined',
            foodId: '',
          },
        },
      },
      orderId,
    };

    dispatch(participantOrderManagementThunks.updateOrder(payload));
  };

  return {
    subOrderDetailModalControl,
    selectedEvent,
    setSelectedEvent,
    onRejectSelectDish,
    addSubOrderDocumentToFirebaseInProgress,
    participantPostRatingInProgress,
    updateSubOrderInProgress,
    updateOrderInProgress,
  };
};

export default useSubOrderPicking;
