/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';

import AlertModal from '@components/Modal/AlertModal';
import ManageOrdersSection from '@components/OrderDetails/EditView/ManageOrderDetailSection/ManageOrdersSection';
import ManageParticipantsSection from '@components/OrderDetails/EditView/ManageParticipantsSection/ManageParticipantsSection';
import OrderDeadlineCountdownSection from '@components/OrderDetails/EditView/OrderDeadlineCountdownSection/OrderDeadlineCountdownSection';
import OrderLinkSection from '@components/OrderDetails/EditView/OrderLinkSection/OrderLinkSection';
import OrderTitle from '@components/OrderDetails/EditView/OrderTitle/OrderTitle';
import PriceQuotation from '@components/OrderDetails/PriceQuotation/PriceQuotation';
import type { TReviewInfoFormValues } from '@components/OrderDetails/ReviewView/ReviewInfoSection/ReviewInfoForm';
import ReviewView from '@components/OrderDetails/ReviewView/ReviewView';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { orderManagementThunks } from '@redux/slices/OrderManagement.slice';
import { companyPaths } from '@src/paths';
import { Listing } from '@utils/data';
import { EOrderDraftStates, EOrderStates } from '@utils/enums';
import type { TListing } from '@utils/types';

import { downloadPriceQuotation } from './helpers/downloadPriceQuotation';
import { usePrepareOrderDetailPageData } from './hooks/usePrepareData';

import css from './OrderDetail.module.scss';

enum EPageViewMode {
  edit = 'edit',
  review = 'review',
  priceQuotation = 'priceQuotation',
}

const BookerAccessibleOrderStates = [EOrderStates.picking];

const OrderDetailPage = () => {
  const [viewMode, setViewMode] = useState<EPageViewMode>(EPageViewMode.edit);
  const intl = useIntl();
  const router = useRouter();
  const confirmCancelOrderActions = useBoolean(false);
  const dispatch = useAppDispatch();

  const {
    query: { orderId },
    isReady: isRouterReady,
  } = router;

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

  const EditViewComponent = (
    <div className={css.editViewRoot}>
      <OrderTitle
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

  const ReviewViewComponent = (
    <ReviewView
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
        return <PriceQuotation data={priceQuotationData} />;
      case EPageViewMode.review:
        return ReviewViewComponent;
      case EPageViewMode.edit:
      default:
        return EditViewComponent;
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

  return renderView();
};

export default OrderDetailPage;
