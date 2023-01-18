import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import { useAppSelector } from '@hooks/reduxHooks';
import get from 'lodash/get';
import { useState } from 'react';

import { orderDetailsAnyActionsInProgress } from '../BookerOrderManagement.slice';
import css from './BookerOrderDetails.module.scss';
import BookerOrderDetailsCountdownSection from './BookerOrderDetailsEditView/BookerOrderDetailsCountdownSection/BookerOrderDetailsCountdownSection';
import BookerOrderDetailsManageOrdersSection from './BookerOrderDetailsEditView/BookerOrderDetailsManageOrdersSection/BookerOrderDetailsManageOrdersSection';
import BookerOrderDetailsManageParticipantsSection from './BookerOrderDetailsEditView/BookerOrderDetailsManageParticipantsSection/BookerOrderDetailsManageParticipantsSection';
import BookerOrderDetailsOrderLinkSection from './BookerOrderDetailsEditView/BookerOrderDetailsOrderLinkSection/BookerOrderDetailsOrderLinkSection';
import BookerOrderDetailsTitle from './BookerOrderDetailsEditView/BookerOrderDetailsTitle/BookerOrderDetailsTitle';
import ReviewCartSection from './BookerOrderDetailsReviewView/ReviewCartSection/ReviewCartSection';
import type { TReviewInfoFormValues } from './BookerOrderDetailsReviewView/ReviewInfoSection/ReviewInfoForm';
import ReviewInfoSection from './BookerOrderDetailsReviewView/ReviewInfoSection/ReviewInfoSection';
import ReviewOrderDetailsSection from './BookerOrderDetailsReviewView/ReviewOrderDetailsSection/ReviewOrderDetailsSection';
import ReviewOrdersResultSection from './BookerOrderDetailsReviewView/ReviewOrdersResultSection/ReviewOrdersResultSection';
import ReviewTitleSection from './BookerOrderDetailsReviewView/ReviewTitleSection/ReviewTitleSection';

enum EBookerOrderDetailsPageViewMode {
  edit = 'edit',
  review = 'review',
}

const BookerOrderDetailsPage = () => {
  const [viewMode, setViewMode] = useState<EBookerOrderDetailsPageViewMode>(
    EBookerOrderDetailsPageViewMode.review,
  );
  const { orderData, planData, participantData, companyData } = useAppSelector(
    (state) => state.BookerOrderManagement,
  );
  const inProgress = useAppSelector(orderDetailsAnyActionsInProgress);
  const { title: orderTitle = '' } = orderData?.attributes || {};

  const { generalInfo = {}, participants = [] } =
    orderData?.attributes?.metadata || {};
  const {
    startDate = 0,
    endDate = 0,
    deliveryHour,
    deliveryAddress,
    orderDeadline = 0,
    deadlineHour,
    staffName,
  } = generalInfo || {};
  const { orderDetail } = get(planData, 'attributes.metadata', {});
  const { companyName } = get(companyData, 'attributes.profile.publicData', {});

  /* =============== Edit data =============== */
  const titleSectionData = { deliveryHour, deliveryAddress };
  const countdownSectionData = { deadlineHour, orderDeadline, startDate };
  const linkSectionData = { orderDeadline };
  const manageParticipantData = {
    planData,
    participantData,
  };
  const manageOrdersData = {
    startDate,
    endDate,
  };

  /* =============== Review data =============== */
  const reviewInfoData = {
    deliveryAddress,
    staffName,
    companyName,
  };
  const reviewResultData = {
    participantData,
    participants,
    orderDetail,
  };

  const handleConfirmOrder = () => {
    setViewMode(EBookerOrderDetailsPageViewMode.review);
  };

  const handleGoBackFromReviewMode = () => {
    setViewMode(EBookerOrderDetailsPageViewMode.edit);
  };

  const handleSubmitReviewInfoForm = (_values: TReviewInfoFormValues) => {
    console.log('🚀 ~ handleSubmitReviewInfoForm ~ _values', _values);
  };

  const EditView = (
    <div className={css.editViewRoot}>
      <BookerOrderDetailsTitle
        className={css.titlePart}
        data={titleSectionData}
        onConfirmOrder={handleConfirmOrder}
      />

      <div className={css.leftPart}>
        <BookerOrderDetailsManageOrdersSection data={manageOrdersData} />
      </div>
      <div className={css.rightPart}>
        <BookerOrderDetailsCountdownSection
          className={css.container}
          data={countdownSectionData}
        />
        <BookerOrderDetailsOrderLinkSection
          className={css.container}
          data={linkSectionData}
        />
        <BookerOrderDetailsManageParticipantsSection
          className={css.container}
          data={manageParticipantData}
        />
      </div>
    </div>
  );

  const ReviewView = (
    <div className={css.reviewViewRoot}>
      <ReviewTitleSection
        className={css.titlePart}
        orderTitle={orderTitle}
        onGoBack={handleGoBackFromReviewMode}
      />
      <div className={css.leftPart}>
        <ReviewInfoSection
          className={css.infoRoot}
          data={reviewInfoData}
          onSubmit={handleSubmitReviewInfoForm}
        />
        <ReviewOrdersResultSection
          className={css.resultRoot}
          data={reviewResultData}
          goBackToEditMode={handleGoBackFromReviewMode}
        />
        <ReviewOrderDetailsSection
          className={css.detailRoot}
          orderDetail={orderDetail}
        />
      </div>
      <div className={css.rightPart}>
        <ReviewCartSection className={css.cartRoot} />
      </div>
    </div>
  );

  const renderView = () => {
    switch (viewMode) {
      case EBookerOrderDetailsPageViewMode.review:
        return ReviewView;
      case EBookerOrderDetailsPageViewMode.edit:
      default:
        return EditView;
    }
  };

  return <>{inProgress ? <LoadingContainer /> : renderView()}</>;
};

export default BookerOrderDetailsPage;
