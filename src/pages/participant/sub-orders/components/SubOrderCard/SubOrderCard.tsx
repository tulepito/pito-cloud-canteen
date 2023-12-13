import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import last from 'lodash/last';

import Badge, { EBadgeType } from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import IconRatingFace from '@components/Icons/IconRatingFace/IconRatingFace';
import IconShop from '@components/Icons/IconShop/IconShop';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import ResponsiveImage from '@components/ResponsiveImage/ResponsiveImage';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { Listing } from '@src/utils/data';
import { formatTimestamp } from '@src/utils/dates';
import { EImageVariants } from '@src/utils/enums';
import type { TListing } from '@src/utils/types';

import { SubOrdersThunks } from '../../SubOrders.slice';

import css from './SubOrderCard.module.scss';

type SubOrderCardProps = {
  subOrder: any;
  setSelectedSubOrder: (subOrder: any) => void;
  openSubOrderReviewModal: () => void;
  setSelectedEvent?: (event: any) => void;
  openRatingSubOrderModal?: () => void;
};

const getTxStatusLabel = (txStatus: string) => {
  switch (txStatus) {
    case 'delivering':
      return 'Đang giao hàng';
    case 'delivered':
      return 'Đã giao hàng';
    default:
      return 'Đã chọn món';
  }
};

const getTxStatusBadgeType = (txStatus: string) => {
  switch (txStatus) {
    case 'delivering':
      return EBadgeType.info;
    case 'delivered':
      return EBadgeType.success;
    default:
      return EBadgeType.warning;
  }
};

const SubOrderCard: React.FC<SubOrderCardProps> = (props) => {
  const {
    subOrder,
    setSelectedSubOrder,
    openSubOrderReviewModal,
    setSelectedEvent,
    openRatingSubOrderModal,
  } = props;
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const {
    foodImage,
    foodName,
    restaurantName,
    txStatus,
    id,
    reviewId,
    deliveryHour,
    restaurantId,
  } = subOrder;
  const timestamp = parseInt(`${last(id.split(' - '))}`, 10);
  const subOrderReview = useAppSelector(
    (state) => state.ParticipantSubOrderList.subOrderReview,
  );
  const review = subOrderReview.find(
    (_review: any) => _review.id.uuid === reviewId,
  );
  const reviewListing = Listing(review as TListing);
  const { generalRating } = reviewListing.getMetadata();
  const subOrderTime = `${deliveryHour} ${formatTimestamp(
    timestamp,
    "EEEE, 'ngày' dd/MM/yyyy",
  )}`;
  const isSubOrderDelivered = txStatus === 'delivered';
  useEffect(() => {
    if (reviewId) {
      dispatch(SubOrdersThunks.fetchReviewFromSubOrder(reviewId));
    }
  }, [dispatch, reviewId]);
  const openReviewRatingModal = () => {
    setSelectedEvent?.({
      resource: {
        ...subOrder,
        timestamp,
        restaurant: {
          id: restaurantId,
        },
      },
    });
    openRatingSubOrderModal?.();
  };

  const openReviewModal = () => {
    if (reviewId) {
      setSelectedSubOrder(subOrder);
      openSubOrderReviewModal();
    }
  };

  return (
    <div className={css.container} onClick={openReviewModal}>
      <div className={css.leftSide}>
        <div className={css.imageWrapper}>
          <ResponsiveImage
            variants={[EImageVariants.squareSmall2x]}
            alt={foodName}
            image={foodImage}
            className={css.image}
            emptyType="food"
          />
        </div>
      </div>
      <div className={css.rightSide}>
        <div className={css.inforSection}>
          <div className={css.restaurantName}>{restaurantName}</div>
          <div className={css.dishName}>{foodName}</div>
          <div className={css.time}>{subOrderTime}</div>
        </div>
        <div className={css.inforSectionDesktop}>
          <div className={css.dishName} title={foodName}>
            {foodName}
          </div>
          <div className={css.time}>{subOrderTime}</div>
          <div className={css.restaurantName}>
            <IconShop className={css.iconShop} />
            <span title={restaurantName}>{restaurantName}</span>
          </div>
        </div>
        <div className={css.bottomSection}>
          <Badge
            className={css.badge}
            type={getTxStatusBadgeType(txStatus)}
            label={getTxStatusLabel(txStatus)}
          />
          <RenderWhen condition={isSubOrderDelivered}>
            <RenderWhen condition={!reviewId}>
              <Button className={css.ratingBtn} onClick={openReviewRatingModal}>
                Đánh giá
              </Button>
              <RenderWhen.False>
                <div className={css.rating}>
                  <IconRatingFace
                    rating={+generalRating}
                    className={css.iconFace}
                  />
                  <div className={css.ratingText}>
                    {intl.formatMessage({
                      id: `FieldRating.label.${generalRating}`,
                    })}
                  </div>
                </div>
              </RenderWhen.False>
            </RenderWhen>
          </RenderWhen>
        </div>
      </div>
    </div>
  );
};

export default SubOrderCard;
