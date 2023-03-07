/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';

import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import AlertModal from '@components/Modal/AlertModal';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { companyPaths } from '@src/paths';
import { Listing } from '@utils/data';
import { EOrderDraftStates, EOrderStates } from '@utils/enums';
import type { TListing } from '@utils/types';

import {
  orderDetailsAnyActionsInProgress,
  orderManagementThunks,
} from '../../OrderManagement.slice';
import { downloadPriceQuotation } from '../helpers/downloadPriceQuotation';
import { usePrepareOrderDetailPageData } from '../hooks/usePrepareData';

import BookerOrderDetailsTitle from './BookerOrderDetailsEditView/BookerOrderDetailsTitle/BookerOrderDetailsTitle';
import ManageOrdersSection from './BookerOrderDetailsEditView/ManageOrdersSection/ManageOrdersSection';
import ManageParticipantsSection from './BookerOrderDetailsEditView/ManageParticipantsSection/ManageParticipantsSection';
import OrderDeadlineCountdownSection from './BookerOrderDetailsEditView/OrderDeadlineCountdownSection/OrderDeadlineCountdownSection';
import OrderLinkSection from './BookerOrderDetailsEditView/OrderLinkSection/OrderLinkSection';
import BookerOrderDetailsPriceQuotation from './BookerOrderDetailsPriceQuotation/BookerOrderDetailsPriceQuotation';
import BookerOrderDetailReviewView from './BookerOrderDetailsReviewView/BookerOrderDetailsReviewView/BookerOrderDetailReviewView';
import type { TReviewInfoFormValues } from './BookerOrderDetailsReviewView/ReviewInfoSection/ReviewInfoForm';

import css from './BookerOrderDetails.module.scss';

enum EPageViewMode {
  edit = 'edit',
  review = 'review',
  priceQuotation = 'priceQuotation',
}

const BookerAccessibleOrderStates = [EOrderStates.picking];

const BookerOrderDetailsPage = () => {
  const [viewMode, setViewMode] = useState<EPageViewMode>(EPageViewMode.edit);
  const intl = useIntl();
  const router = useRouter();
  const confirmCancelOrderActions = useBoolean(false);
  const dispatch = useAppDispatch();

  const {
    query: { orderId },
    isReady: isRouterReady,
  } = router;

  const inProgress = useAppSelector(orderDetailsAnyActionsInProgress);
  const cancelPickingOrderInProgress = useAppSelector(
    (state) => state.OrderManagement.cancelPickingOrderInProgress,
  );
  const { orderData } = useAppSelector((state) => state.OrderManagement);
  const {
    editViewData,
    reviewViewData,
    priceQuotationData,
    setReviewInfoValues,
  } = usePrepareOrderDetailPageData();

  const { orderState } = Listing(orderData as TListing).getMetadata();

  const handleConfirmOrder = () => {
    setViewMode(EPageViewMode.review);
  };

  const handleGoBackFromReviewMode = () => {
    setViewMode(EPageViewMode.edit);
  };

  const handleSubmitReviewInfoForm = (_values: TReviewInfoFormValues) => {
    setReviewInfoValues(_values);
  };

  const handleAgreeCancelOrder = async () => {
    await dispatch(orderManagementThunks.cancelPickingOrder(orderId as string));
    confirmCancelOrderActions.setFalse();
    router.push({
      pathname: companyPaths.ManageOrderDetail,
      query: { orderId },
    });
  };

  const handleDisagreeCancelOrder = () => {
    confirmCancelOrderActions.setFalse();
  };

  const EditView = (
    <div className={css.editViewRoot}>
      <BookerOrderDetailsTitle
        className={css.titlePart}
        data={editViewData.titleSectionData}
        onConfirmOrder={handleConfirmOrder}
        onCancelOrder={confirmCancelOrderActions.setTrue}
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

      <AlertModal
        isOpen={confirmCancelOrderActions.value}
        handleClose={confirmCancelOrderActions.setFalse}
        title={intl.formatMessage({
          id: 'BookerOrderDetailsPage.confirmCancelOrderModal.title',
        })}
        confirmLabel={intl.formatMessage({
          id: 'BookerOrderDetailsPage.confirmCancelOrderModal.confirmText',
        })}
        cancelLabel={intl.formatMessage({
          id: 'BookerOrderDetailsPage.confirmCancelOrderModal.cancelText',
        })}
        onConfirm={handleAgreeCancelOrder}
        onCancel={handleDisagreeCancelOrder}
        confirmInProgress={cancelPickingOrderInProgress}
        cancelDisabled={cancelPickingOrderInProgress}
      />
    </div>
  );

  const ReviewView = (
    <BookerOrderDetailReviewView
      canGoBackEditMode
      reviewViewData={reviewViewData}
      onSubmitEdit={handleSubmitReviewInfoForm}
      onDownloadPriceQuotation={downloadPriceQuotation(priceQuotationData)}
      onGoBackToEditOrderPage={handleGoBackFromReviewMode}
      showStartPickingOrderButton
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
    if (!isEmpty(orderState)) {
      setViewMode(
        orderState === EOrderStates.picking
          ? EPageViewMode.edit
          : EPageViewMode.review,
      );
    }
  }, [orderState]);

  useEffect(() => {
    if (
      !isEmpty(orderState) &&
      isRouterReady &&
      !BookerAccessibleOrderStates.includes(orderState)
    ) {
      router.push({
        pathname: companyPaths.ManageOrderDetail,
        query: { orderId },
      });
    }
  }, [isRouterReady, orderState, orderId]);

  useEffect(() => {
    if (isRouterReady && orderState) {
      switch (orderState) {
        case EOrderDraftStates.pendingApproval:
        case EOrderStates.picking:
          break;
        case EOrderDraftStates.draft:
          router.push(companyPaths.ManageOrders);
          break;
        default:
          if (orderId) {
            router.push({
              pathname: companyPaths.ManageOrderDetail,
              query: { orderId },
            });
          }
          break;
      }
    }
  }, [isRouterReady, orderState]);

  return (
    <RenderWhen condition={inProgress}>
      <LoadingContainer />
      <RenderWhen.False>{renderView()}</RenderWhen.False>
    </RenderWhen>
  );
};

export default BookerOrderDetailsPage;
