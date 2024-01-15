import { useCallback, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import IconArrow from '@components/Icons/IconArrow/IconArrow';
import Modal from '@components/Modal/Modal';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import SlideModal from '@components/SlideModal/SlideModal';
import Tabs from '@components/Tabs/Tabs';
import { useViewport } from '@hooks/useViewport';
import { Listing } from '@src/utils/data';
import type { TListing } from '@src/utils/types';

import useRestaurantReview from '../../hooks/restaurantReview';
import ReviewItem from '../ReviewItem/ReviewItem';

import css from './RestaurantReviewModal.module.scss';

type RestaurantReviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ReviewItemList = ({
  isSeeAll,
  reviewList,
  reviewerList,
  inProgress,
  totalReview,
  onFetching,
}: any) => {
  const intl = useIntl();
  const noReview = reviewList.length === 0;
  const isShowAllReviews = reviewList.length === totalReview;

  const shouldShowLoadMore =
    isSeeAll && !inProgress && !isShowAllReviews && !noReview;

  return (
    <div className={css.reviewList}>
      {noReview && !inProgress && (
        <div className={css.noReview}>
          {intl.formatMessage({
            id: 'OrderRatingForm.noReview',
          })}
        </div>
      )}
      {reviewList.map((review: any) => {
        const reviewListing = Listing(review);
        const {
          generalRating,
          detailRating,
          timestamp,
          foodName,
          detailTextRating,
        } = reviewListing.getMetadata();
        const { createdAt: reviewAt } = reviewListing.getAttributes();

        return (
          <div className={css.reviewItem} key={reviewListing.getId()}>
            <ReviewItem
              generalRating={generalRating}
              detailRating={detailRating}
              user={reviewerList?.[reviewListing.getId()]}
              timestamp={timestamp}
              foodName={foodName}
              detailTextRating={detailTextRating}
              reviewAt={reviewAt}
            />
          </div>
        );
      })}
      {inProgress && <div className={css.loading}>Đang tải...</div>}
      {shouldShowLoadMore && (
        <div className={css.loadMore} onClick={onFetching}>
          {intl.formatMessage({
            id: 'RestaurantCard.viewDetailText',
          })}
        </div>
      )}
    </div>
  );
};

const RestaurantReviewModal: React.FC<RestaurantReviewModalProps> = (props) => {
  const { isOpen, onClose } = props;
  const intl = useIntl();
  const { isMobileLayout } = useViewport();
  const [reviewPage, setReviewPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'booker' | 'participant'>(
    'booker',
  );
  const {
    restaurantBookerReviews = [],
    restaurantParticipantReviews = [],
    selectedRestaurant,
    restaurantBookerReviewers,
    restaurantParticipantReviewers,
    fetchRestaurantReviewInProgress,
    bookerReviewPagination,
    participantReviewPagination,
  } = useRestaurantReview(activeTab, true, reviewPage);
  const selectedRestaurantListing = useMemo(
    () => Listing(selectedRestaurant as TListing),
    [selectedRestaurant],
  );
  const { detailRating, totalRatingNumber = 0 } =
    selectedRestaurantListing.getMetadata();

  const { food, packaging } = detailRating || {};
  const bookerReviewNumber = restaurantBookerReviews.length;
  const participantReviewNumber = restaurantParticipantReviews.length;
  const totalComments = totalRatingNumber;
  const tabItems = [
    {
      key: 'booker',
      label: (
        <div className={css.tabLabel}>
          <span>
            {intl.formatMessage({
              id: 'OrderRatingForm.BookerReviewTab',
            })}
          </span>
          <div data-number className={css.commentNumber}>
            {!fetchRestaurantReviewInProgress ? bookerReviewNumber : 0}
          </div>
        </div>
      ),
      childrenFn: (childProps: any) => <ReviewItemList {...childProps} />,
      childrenProps: {
        isSeeAll: true,
        reviewList: restaurantBookerReviews,
        reviewerList: restaurantBookerReviewers,
        inProgress: fetchRestaurantReviewInProgress,
        totalReview: bookerReviewPagination?.totalItems,
        onFetching: () => setReviewPage(reviewPage + 1),
      },
    },
    {
      key: 'participant',
      label: (
        <div className={css.tabLabel}>
          <span>
            {intl.formatMessage({
              id: 'OrderRatingForm.ParticipantReviewTab',
            })}
          </span>
          <div data-number className={css.commentNumber}>
            {!fetchRestaurantReviewInProgress ? participantReviewNumber : 0}
          </div>
        </div>
      ),
      childrenFn: (childProps: any) => <ReviewItemList {...childProps} />,
      childrenProps: {
        isSeeAll: true,
        reviewList: restaurantParticipantReviews,
        reviewerList: restaurantParticipantReviewers,
        inProgress: fetchRestaurantReviewInProgress,
        totalReview: participantReviewPagination?.totalItems,
        onFetching: () => setReviewPage(reviewPage + 1),
      },
    },
  ];

  const calculateRatingPercent = (rating: number) => {
    return `${(rating / 5) * 100}%`;
  };

  const onTabChange = useCallback((tab: any) => {
    setActiveTab(tab?.key as any);
  }, []);

  const generalView = (
    <>
      <div className={css.modalHeader}>
        <div className={css.detailRatingContainer}>
          <div className={css.detailRatingRow}>
            <span className={css.scenarioLabel}>
              {intl.formatMessage({
                id: 'AddOrderForm.foodIdField.placeholder',
              })}
              :
            </span>
            <div className={css.ratingBar}>
              <div
                style={{ width: calculateRatingPercent(food || 0) }}
                className={css.activeBar}></div>
            </div>
            <span className={css.ratingPoint}>{`${food || 0}/5`}</span>
          </div>
          <div className={css.detailRatingRow}>
            <span className={css.scenarioLabel}>
              {intl.formatMessage({
                id: 'ManagePartnerReviewsPage.packageTitle',
              })}
              :
            </span>
            <div className={css.ratingBar}>
              <div
                style={{
                  width: calculateRatingPercent(packaging || 0),
                }}
                className={css.activeBar}></div>
            </div>
            <span className={css.ratingPoint}>{`${packaging || 0}/5`}</span>
          </div>
        </div>
      </div>
      <div className={css.modalContent}>
        <div className={css.contentHeader}>
          <div className={css.totalComment}>
            {`Bình luận (${totalComments})`}
          </div>
        </div>
      </div>
    </>
  );

  const detailView = (
    <div className={css.modalContent}>
      <div className={css.contentHeader}>
        <div className={css.totalComment}>{`Bình luận (${totalComments})`}</div>
      </div>
    </div>
  );

  return (
    <RenderWhen condition={isMobileLayout}>
      <SlideModal
        id="RestaurantReviewModal"
        isOpen={isOpen}
        onClose={onClose}
        containerClassName={css.modalContainer}
        modalTitle={
          <div className={css.titleSlideModal}>
            <IconArrow direction="left" onClick={onClose} />
            <span>
              {intl.formatMessage({
                id: 'MemberDetailPage.backButton',
              })}
            </span>
          </div>
        }>
        {generalView}
        <div className={css.content}>
          <Tabs items={tabItems as any} onChange={onTabChange} />
        </div>
      </SlideModal>
      <RenderWhen.False>
        <Modal
          id="RestaurantReviewModal"
          isOpen={isOpen}
          handleClose={onClose}
          containerClassName={css.modalContainer}
          scrollLayerClassName={css.scrollLayer}
          title={intl.formatMessage({
            id: 'ManageCompanyOrdersPage.actionBtn.reviewOrder',
          })}>
          {detailView}
          <div className={css.content}>
            <Tabs items={tabItems as any} onChange={onTabChange} />
          </div>
        </Modal>
      </RenderWhen.False>
    </RenderWhen>
  );
};

export default RestaurantReviewModal;
