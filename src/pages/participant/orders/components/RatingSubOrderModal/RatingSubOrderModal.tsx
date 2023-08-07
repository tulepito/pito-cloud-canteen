import { useMemo } from 'react';
import type { Event } from 'react-big-calendar';

import SlideModal from '@components/SlideModal/SlideModal';
import { useAppDispatch } from '@hooks/reduxHooks';
import { resetImage } from '@redux/slices/uploadImage.slice';

import { OrderListThunks } from '../../OrderList.slice';
import type { TRatingSubOrderFormValues } from '../RatingSubOrderForm/RatingSubOrderForm';
import RatingSubOrderForm from '../RatingSubOrderForm/RatingSubOrderForm';

type TRatingSubOrderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  selectedEvent: Event | null;
  openSuccessRatingModal: () => void;
  participantPostRatingInProgress?: boolean;
};
const RatingSubOrderModal: React.FC<TRatingSubOrderModalProps> = (props) => {
  const {
    isOpen,
    onClose,
    currentUserId,
    selectedEvent,
    openSuccessRatingModal,
    participantPostRatingInProgress,
  } = props;
  const dispatch = useAppDispatch();
  const { orderId, restaurant, timestamp, planId } =
    selectedEvent?.resource || {};
  const restaurantId = restaurant?.id;

  const handleClose = () => {
    dispatch(resetImage());
    onClose();
  };

  const initialValues: TRatingSubOrderFormValues = useMemo(
    () => ({
      general: '',
      food: '',
      packaging: '',
      detailTextRating: '',
      images: [],
    }),
    [],
  );

  const handleSubmit = async (values: TRatingSubOrderFormValues) => {
    const { general, food, packaging, detailTextRating } = values;
    const rating = {
      orderId: orderId as string,
      restaurantId,
      timestamp,
      reviewerId: currentUserId,
      generalRating: +general,
      detailRating: {
        food: {
          rating: +food,
        },
        packaging: {
          rating: +packaging,
        },
      },
    };

    const { meta } = await dispatch(
      OrderListThunks.postParticipantRating({
        rating,
        detailTextRating,
        planId,
      }),
    );

    if (meta.requestStatus === 'fulfilled') {
      handleClose();
      openSuccessRatingModal();
      dispatch(resetImage());
    }
  };

  return (
    <SlideModal id="RatingSubOrderModal" isOpen={isOpen} onClose={handleClose}>
      <RatingSubOrderForm
        onSubmit={handleSubmit}
        initialValues={initialValues}
        inProgress={participantPostRatingInProgress}
      />
    </SlideModal>
  );
};

export default RatingSubOrderModal;
