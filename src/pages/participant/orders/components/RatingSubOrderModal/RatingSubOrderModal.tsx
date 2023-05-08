import { useEffect } from 'react';
import type { Event } from 'react-big-calendar';
import { shallowEqual } from 'react-redux';

import SlideModal from '@components/SlideModal/SlideModal';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
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
};
const RatingSubOrderModal: React.FC<TRatingSubOrderModalProps> = (props) => {
  const {
    isOpen,
    onClose,
    currentUserId,
    selectedEvent,
    openSuccessRatingModal,
  } = props;
  const dispatch = useAppDispatch();
  const { orderId, restaurant, timestamp } = selectedEvent?.resource || {};
  const restaurantId = restaurant?.id;
  const images = useAppSelector(
    (state) => state.uploadImage.images,
    shallowEqual,
  );
  const postRatingInProgress = useAppSelector(
    (state) => state.ParticipantOrderList.participantPostRatingInProgress,
  );

  useEffect(() => {
    dispatch(resetImage());
  }, []);

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
      OrderListThunks.postParticipantRating({ rating, detailTextRating }),
    );

    if (meta.requestStatus === 'fulfilled') {
      openSuccessRatingModal();
    }
  };

  return (
    <SlideModal id="RatingSubOrderModal" isOpen={isOpen} onClose={onClose}>
      <RatingSubOrderForm
        onSubmit={handleSubmit}
        images={images}
        inProgress={postRatingInProgress}
      />
    </SlideModal>
  );
};

export default RatingSubOrderModal;
