import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import { useAppSelector } from '@hooks/reduxHooks';
import { companyPaths } from '@src/paths';
import { Listing } from '@utils/data';
import { EOrderStates } from '@utils/enums';
import type { TListing } from '@utils/types';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

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
  const router = useRouter();

  const {
    query: { orderId },
    isReady: isRouterReady,
  } = router;

  const inProgress = useAppSelector(orderDetailsAnyActionsInProgress);
  const { orderData } = useAppSelector((state) => state.OrderManagement);
  const {
    editViewData,
    reviewViewData,
    priceQuotationData,
    setReviewInfoValues,
  } = usePrepareOrderDetailPageData();

  const { orderState } = Listing(orderData as TListing).getMetadata();
  const showStartPickingOrderButton = orderState === EOrderStates.picking;

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
      showStartPickingOrderButton={showStartPickingOrderButton}
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

  useEffect(() => {
    setViewMode(
      orderState === EOrderStates.isNew
        ? EPageViewMode.edit
        : EPageViewMode.review,
    );
  }, [orderState]);

  useEffect(() => {
    if (isRouterReady && orderState) {
      switch (orderState) {
        case EOrderStates.isNew:
        case EOrderStates.picking:
          break;
        case EOrderStates.draft:
          console.log('go draft');
          router.push(companyPaths.ManageOrders);
          break;
        default:
          if (orderId) {
            console.log('go default');

            router.push({
              pathname: companyPaths.ManageOrderDetail,
              query: { orderId },
            });
          }
          break;
      }
    }
  }, [isRouterReady, orderState]);

  return <>{inProgress ? <LoadingContainer /> : renderView()}</>;
};

export default BookerOrderDetailsPage;
