import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import isEmpty from 'lodash/isEmpty';
import last from 'lodash/last';

import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconRatingFace from '@components/Icons/IconRatingFace/IconRatingFace';
import LoadingModal from '@components/LoadingModal/LoadingModal';
import Modal from '@components/Modal/Modal';
import ResponsiveImage from '@components/ResponsiveImage/ResponsiveImage';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { Listing } from '@src/utils/data';
import { formatTimestamp } from '@src/utils/dates';
import { EImageVariants } from '@src/utils/enums';
import type { TImage, TListing } from '@src/utils/types';

import { SubOrdersThunks } from '../../SubOrders.slice';

import css from './SubOrderReviewModal.module.scss';

type SubOrderReviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  subOrder: any;
};

const SubOrderReviewModal: React.FC<SubOrderReviewModalProps> = (props) => {
  const { isOpen, onClose, subOrder } = props;
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const subOrderReview = useAppSelector(
    (state) => state.ParticipantSubOrderList.subOrderReview,
  );

  const fetchReviewInProgress = useAppSelector(
    (state) => state.ParticipantSubOrderList.fetchReviewInProgress,
  );

  const { foodName, restaurantName, id, reviewId, foodImage } = subOrder;
  const review = subOrderReview.find(
    (_review: any) => _review.id.uuid === reviewId,
  );
  const subOrderReviewListing = Listing(review as TListing);
  const timestamp = parseInt(`${last(id.split(' - '))}`, 10);
  const subOrderTime = formatTimestamp(timestamp, 'dd/MM/yyyy');
  const reviewImages = subOrderReviewListing.getImages();
  const {
    detailRating = {},
    generalRating,
    detailTextRating,
  } = subOrderReviewListing.getMetadata();
  const { food, packaging } = detailRating;
  useEffect(() => {
    if (reviewId) {
      dispatch(SubOrdersThunks.fetchReviewFromSubOrder(reviewId));
    }
  }, [dispatch, reviewId]);

  return fetchReviewInProgress || isEmpty(subOrderReview) ? (
    <LoadingModal isOpen={fetchReviewInProgress} />
  ) : (
    <Modal
      id="SubOrderReviewModal"
      isOpen={isOpen}
      handleClose={onClose}
      className={css.modal}
      closeClassName={css.closedModal}
      containerClassName={css.modalContainer}
      shouldHideIconClose>
      <div className={css.goBack} onClick={onClose}>
        <IconArrow direction="left" />
        <span>Quay lại</span>
      </div>
      <div className={css.restaurantInfor}>
        <div className={css.leftSide}>
          <div className={css.imageWrapper}>
            <ResponsiveImage
              variants={[EImageVariants.squareSmall2x]}
              alt={foodName}
              image={foodImage}
              className={css.image}
            />
          </div>
        </div>
        <div className={css.rightSide}>
          <div className={css.inforSection}>
            <div className={css.restaurantName}>{restaurantName}</div>
            <div className={css.dishName}>{foodName}</div>
          </div>
          <div className={css.rating}>
            <IconRatingFace rating={generalRating} className={css.iconFace} />
            <div className={css.ratingText}>
              {intl.formatMessage({
                id: `FieldRating.label.${generalRating}`,
              })}
            </div>
          </div>
          <div className={css.time}>{subOrderTime}</div>
        </div>
      </div>
      <div className={css.reviewInfor}>
        <div className={css.rating}>
          <IconRatingFace rating={+food.rating} className={css.iconFace} />
          <div className={css.ratingText}>
            <span>Món ăn: </span>
            {intl.formatMessage({
              id: `FieldRating.label.${food.rating}`,
            })}
          </div>
        </div>
        <div className={css.rating}>
          <IconRatingFace rating={+packaging.rating} className={css.iconFace} />
          <div className={css.ratingText}>
            <span>Dụng cụ: </span>
            {intl.formatMessage({
              id: `FieldRating.label.${packaging.rating}`,
            })}
          </div>
        </div>
      </div>
      <div className={css.detailReview}>{detailTextRating}</div>
      <div className={css.imageList}>
        {reviewImages.map((image: TImage) => (
          <div key={image.id.uuid} className={css.imageWrapper}>
            <ResponsiveImage
              alt=""
              image={image}
              className={css.image}
              variants={[EImageVariants.landscapeCrop2x]}
            />
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default SubOrderReviewModal;
