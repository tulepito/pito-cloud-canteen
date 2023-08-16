import { useState } from 'react';
import type { Event } from 'react-big-calendar';

import { useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';

const useSubOrderPicking = () => {
  const subOrderDetailModalControl = useBoolean();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
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

  return {
    subOrderDetailModalControl,
    selectedEvent,
    setSelectedEvent,
    addSubOrderDocumentToFirebaseInProgress,
    participantPostRatingInProgress,
    updateSubOrderInProgress,
    updateOrderInProgress,
  };
};

export default useSubOrderPicking;
