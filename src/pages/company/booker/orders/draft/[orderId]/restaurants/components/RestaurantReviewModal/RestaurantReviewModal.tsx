import { useMemo, useState } from 'react';

import IconArrow from '@components/Icons/IconArrow/IconArrow';
import Modal from '@components/Modal/Modal';
import Tabs from '@components/Tabs/Tabs';
import useBoolean from '@hooks/useBoolean';
import { Listing } from '@src/utils/data';
import type { TListing } from '@src/utils/types';

import useRestaurantReview from '../../hooks/restaurantReview';
import ReviewItem from '../ReviewItem/ReviewItem';

import css from './RestaurantReviewModal.module.scss';

type RestaurantReviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ReviewItemList = ({ reviewList, reviewerList }: any) => {
  const noReview = reviewList.length === 0;

  return (
    <div>
      {noReview && <div className={css.noReview}>Chưa có đánh giá</div>}
      {reviewList.map((review: any) => {
        const reviewListing = Listing(review);
        const { generalRating, detailRating, timestamp } =
          reviewListing.getMetadata();

        return (
          <div className={css.reviewItem} key={reviewListing.getId()}>
            <ReviewItem
              generalRating={generalRating}
              detailRating={detailRating}
              user={reviewerList?.[reviewListing.getId()]}
              timestamp={timestamp}
            />
          </div>
        );
      })}
    </div>
  );
};

const RestaurantReviewModal: React.FC<RestaurantReviewModalProps> = (props) => {
  const { isOpen, onClose } = props;
  const viewAllReviewControl = useBoolean();
  const [activeTab, setActiveTab] = useState<'booker' | 'participant'>(
    'booker',
  );

  const {
    restaurantBookerReviews = [],
    restaurantParticipantReviews = [],
    selectedRestaurant,
    restaurantBookerReviewers,
    restaurantParticipantReviewers,
  } = useRestaurantReview();
  const selectedRestaurantListing = useMemo(
    () => Listing(selectedRestaurant as TListing),
    [selectedRestaurant],
  );
  const { detailRating } = selectedRestaurantListing.getMetadata();

  const { food, packaging } = detailRating || {};
  const bookerReviewNumber = restaurantBookerReviews.length;
  const participantReviewNumber = restaurantParticipantReviews.length;
  const totalComments =
    activeTab === 'booker' ? bookerReviewNumber : participantReviewNumber;

  const tabItems = [
    {
      key: 'booker',
      label: (
        <div className={css.tabLabel}>
          <span>Từ người đặt nhóm</span>
          <div data-number className={css.commentNumber}>
            {bookerReviewNumber}
          </div>
        </div>
      ),
      childrenFn: (childProps: any) => <ReviewItemList {...childProps} />,
      childrenProps: {
        reviewList: restaurantBookerReviews,
        reviewerList: restaurantBookerReviewers,
      },
    },
    {
      key: 'participant',
      label: (
        <div className={css.tabLabel}>
          <span>Từ người tham gia</span>
          <div data-number className={css.commentNumber}>
            {participantReviewNumber}
          </div>
        </div>
      ),
      childrenFn: (childProps: any) => <ReviewItemList {...childProps} />,
      childrenProps: {
        reviewList: restaurantParticipantReviews,
        reviewerList: restaurantParticipantReviewers,
      },
    },
  ];

  const calculateRatingPercent = (rating: number) => {
    return `${(rating / 5) * 100}%`;
  };

  const onTabChange = (tab: any) => {
    setActiveTab(tab?.key as any);
  };

  const onViewAllReview = () => {
    viewAllReviewControl.setTrue();
  };

  const goBackModalTitle = (
    <div className={css.goBack} onClick={viewAllReviewControl.setFalse}>
      <IconArrow direction="left" />
      <span>Quay lại</span>
    </div>
  );

  const generalView = (
    <>
      <div className={css.modalHeader}>
        <div className={css.detailRatingContainer}>
          <div className={css.detailRatingRow}>
            <span className={css.scenarioLabel}>Món ăn:</span>
            <div className={css.ratingBar}>
              <div
                style={{ width: calculateRatingPercent(food?.rating || 0) }}
                className={css.activeBar}></div>
            </div>
            <span className={css.ratingPoint}>{`${food?.rating || 0}/5`}</span>
          </div>
          <div className={css.detailRatingRow}>
            <span className={css.scenarioLabel}>Dụng cụ:</span>
            <div className={css.ratingBar}>
              <div
                style={{
                  width: calculateRatingPercent(packaging?.rating || 0),
                }}
                className={css.activeBar}></div>
            </div>
            <span className={css.ratingPoint}>{`${
              packaging?.rating || 0
            }/5`}</span>
          </div>
        </div>
      </div>
      <div className={css.modalContent}>
        <div className={css.contentHeader}>
          <div className={css.totalComment}>
            {`Bình luận (${totalComments})`}
          </div>
          <div className={css.seeAll} onClick={onViewAllReview}>
            <span>Xem tất cả</span>
            <IconArrow direction="right" />
          </div>
        </div>
        <div className={css.content}>
          <Tabs items={tabItems as any} onChange={onTabChange} />
        </div>
      </div>
    </>
  );

  const detailView = (
    <div className={css.modalContent}>
      <div className={css.contentHeader}>
        <div className={css.totalComment}>{`Bình luận (${totalComments})`}</div>
      </div>
      <div className={css.content}>
        <Tabs items={tabItems as any} onChange={onTabChange} />
      </div>
    </div>
  );

  return (
    <Modal
      id="RestaurantReviewModal"
      isOpen={isOpen}
      handleClose={onClose}
      containerClassName={css.modalContainer}
      scrollLayerClassName={css.scrollLayer}
      title={viewAllReviewControl.value ? goBackModalTitle : 'Đánh giá'}>
      {viewAllReviewControl.value ? detailView : generalView}
    </Modal>
  );
};

export default RestaurantReviewModal;
