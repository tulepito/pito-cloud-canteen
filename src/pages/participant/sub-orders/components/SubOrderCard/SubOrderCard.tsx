import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import last from 'lodash/last';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import IconRatingFace from '@components/Icons/IconRatingFace/IconRatingFace';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import ResponsiveImage from '@components/ResponsiveImage/ResponsiveImage';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { participantPaths } from '@src/paths';
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
};

const SubOrderCard: React.FC<SubOrderCardProps> = (props) => {
  const { subOrder, setSelectedSubOrder, openSubOrderReviewModal } = props;
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const {
    restaurantAvatarImage,
    foodName,
    restaurantName,
    txStatus,
    id,
    reviewId,
    planId,
  } = subOrder;

  const router = useRouter();
  const subOrderReview = useAppSelector(
    (state) => state.ParticipantSubOrderList.subOrderReview,
  );
  const review = subOrderReview.find(
    (_review: any) => _review.id.uuid === reviewId,
  );
  const reviewListing = Listing(review as TListing);
  const { generalRating } = reviewListing.getMetadata();
  const timestamp = parseInt(`${last(id.split(' - '))}`, 10);
  const subOrderTime = formatTimestamp(timestamp, 'HH:mm EEEE, dd/MM/yyyy');
  const hasBottomSection = txStatus === 'delivered';
  useEffect(() => {
    if (reviewId) {
      dispatch(SubOrdersThunks.fetchReviewFromSubOrder(reviewId));
    }
  }, [dispatch, reviewId]);
  const goToRatingPage = () => {
    router.push({
      pathname: participantPaths.OrderList,
      query: {
        planId,
        timestamp,
      },
    });
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
            alt={restaurantName}
            image={restaurantAvatarImage}
            className={css.image}
          />
        </div>
      </div>
      <div className={css.rightSide}>
        <div className={css.inforSection}>
          <div className={css.restaurantName}>{restaurantName}</div>
          <div className={css.dishName}>{foodName}</div>
          <div className={css.time}>{subOrderTime}</div>
        </div>
        <RenderWhen condition={hasBottomSection}>
          <div className={css.bottomSection}>
            <RenderWhen condition={!reviewId}>
              <Button className={css.ratingBtn} onClick={goToRatingPage}>
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
          </div>
        </RenderWhen>
      </div>
    </div>
  );
};

export default SubOrderCard;
