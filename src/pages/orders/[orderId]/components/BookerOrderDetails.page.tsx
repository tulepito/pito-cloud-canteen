import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import { useAppSelector } from '@hooks/reduxHooks';
import { useState } from 'react';

import { downloadPriceQuotation } from '../helpers/downloadPriceQuotation';
import { usePrepareOrderDetailPageData } from '../hooks/usePrepareData';
import { orderDetailsAnyActionsInProgress } from '../OrderManagement.slice';
import css from './BookerOrderDetails.module.scss';
import BookerOrderDetailsTitle from './BookerOrderDetailsEditView/BookerOrderDetailsTitle/BookerOrderDetailsTitle';
import ManageOrdersSection from './BookerOrderDetailsEditView/ManageOrdersSection/ManageOrdersSection';
import ManageParticipantsSection from './BookerOrderDetailsEditView/ManageParticipantsSection/ManageParticipantsSection';
import OrderDeadlineCountdownSection from './BookerOrderDetailsEditView/OrderDeadlineCountdownSection/OrderDeadlineCountdownSection';
import OrderLinkSection from './BookerOrderDetailsEditView/OrderLinkSection/OrderLinkSection';
import BookerOrderDetailsPriceQuotation from './BookerOrderDetailsPriceQuotation/BookerOrderDetailsPriceQuotation';
import BookerOrderDetailReviewView from './BookerOrderDetailsReviewView/BookerOrderDetailsReviewView/BookerOrderDetailReviewView';
import type { TReviewInfoFormValues } from './BookerOrderDetailsReviewView/ReviewInfoSection/ReviewInfoForm';

enum EPageViewMode {
  edit = 'edit',
  review = 'review',
  priceQuotation = 'priceQuotation',
}

const BookerOrderDetailsPage = () => {
  const [viewMode, setViewMode] = useState<EPageViewMode>(EPageViewMode.edit);

  const inProgress = useAppSelector(orderDetailsAnyActionsInProgress);

  const {
    editViewData,
    reviewViewData,
    priceQuotationData,
    setReviewInfoValues,
  } = usePrepareOrderDetailPageData();

  const handleConfirmOrder = () => {
    setViewMode(EPageViewMode.review);
  };

  const handleGoBackFromReviewMode = () => {
    setViewMode(EPageViewMode.edit);
  };

  const handleSubmitReviewInfoForm = (_values: TReviewInfoFormValues) => {
    setReviewInfoValues(_values);
  };

  const EditView = (
    <div className={css.editViewRoot}>
      <BookerOrderDetailsTitle
        className={css.titlePart}
        data={editViewData.titleSectionData}
        onConfirmOrder={handleConfirmOrder}
      />

      <div className={css.leftPart}>
        <ManageOrdersSection data={editViewData.manageOrdersData} />
      </div>
      <div className={css.rightPart}>
        <OrderDeadlineCountdownSection
          className={css.container}
          data={editViewData.countdownSectionData}
        />
        <OrderLinkSection
          className={css.container}
          data={editViewData.linkSectionData}
        />
        <ManageParticipantsSection
          className={css.container}
          data={editViewData.manageParticipantData}
        />
      </div>
    </div>
  );

  const ReviewView = (
    <BookerOrderDetailReviewView
      canGoBackEditMode
      reviewViewData={reviewViewData}
      onSubmitEdit={handleSubmitReviewInfoForm}
      onDownloadPriceQuotation={downloadPriceQuotation(priceQuotationData)}
      onGoBackToEditOrderPage={handleGoBackFromReviewMode}
    />
  );

  const renderView = () => {
    switch (viewMode) {
      case EPageViewMode.priceQuotation:
        return <BookerOrderDetailsPriceQuotation data={priceQuotationData} />;
      case EPageViewMode.review:
        return ReviewView;
      case EPageViewMode.edit:
      default:
        return EditView;
    }
  };

  return <>{inProgress ? <LoadingContainer /> : renderView()}</>;
};

export default BookerOrderDetailsPage;
