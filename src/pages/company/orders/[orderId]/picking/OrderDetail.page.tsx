/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import { isEqual } from 'lodash';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';

import AlertModal from '@components/Modal/AlertModal';
import ManageLineItemsSection from '@components/OrderDetails/EditView/ManageOrderDetailSection/ManageLineItemsSection';
import ManageOrdersSection from '@components/OrderDetails/EditView/ManageOrderDetailSection/ManageOrdersSection';
import ManageParticipantsSection from '@components/OrderDetails/EditView/ManageParticipantsSection/ManageParticipantsSection';
import OrderDeadlineCountdownSection from '@components/OrderDetails/EditView/OrderDeadlineCountdownSection/OrderDeadlineCountdownSection';
import OrderLinkSection from '@components/OrderDetails/EditView/OrderLinkSection/OrderLinkSection';
import OrderTitle from '@components/OrderDetails/EditView/OrderTitle/OrderTitle';
import SubOrderChangesHistorySection from '@components/OrderDetails/EditView/SubOrderChangesHistorySection/SubOrderChangesHistorySection';
import PriceQuotation from '@components/OrderDetails/PriceQuotation/PriceQuotation';
import type { TReviewInfoFormValues } from '@components/OrderDetails/ReviewView/ReviewInfoSection/ReviewInfoForm';
import ReviewView from '@components/OrderDetails/ReviewView/ReviewView';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { useDownloadPriceQuotation } from '@hooks/useDownloadPriceQuotation';
import { usePrepareOrderDetailPageData } from '@hooks/usePrepareOrderManagementData';
import {
  orderDetailsAnyActionsInProgress,
  OrderManagementsAction,
  orderManagementThunks,
} from '@redux/slices/OrderManagement.slice';
import { companyPaths } from '@src/paths';
import { diffDays } from '@src/utils/dates';
import type { TPlan } from '@src/utils/orderTypes';
import { txIsInitiated } from '@src/utils/transaction';
import { CurrentUser, Listing } from '@utils/data';
import {
  EOrderDraftStates,
  EOrderStates,
  EOrderType,
  EParticipantOrderStatus,
} from '@utils/enums';
import type { TListing, TObject } from '@utils/types';

import ModalReachMaxAllowedChanges from '../components/ModalReachMaxAllowedChanges/ModalReachMaxAllowedChanges';

import css from './OrderDetail.module.scss';

enum EPageViewMode {
  edit = 'edit',
  review = 'review',
  priceQuotation = 'priceQuotation',
}

const BookerAccessibleOrderStates = [
  EOrderStates.picking,
  EOrderStates.inProgress,
];

const ViewByOrderStates = {
  [EOrderStates.picking]: EPageViewMode.edit,
  [EOrderStates.inProgress]: EPageViewMode.edit,
};

const ONE_DAY = 1;
const NOW = new Date().getTime();

const checkMinMaxQuantity = (
  orderDetails: TPlan['orderDetail'],
  oldOrderDetail: TPlan['orderDetail'],
  currentViewDate: number,
  isNormalOrder: boolean,
) => {
  let totalQuantity = 0;
  const data = orderDetails?.[currentViewDate] || {};
  const { lineItems = [], restaurant = {} } = data;
  const { maxQuantity = 100, minQuantity = 1 } = restaurant;
  if (isNormalOrder) {
    totalQuantity = lineItems.reduce((result: number, lineItem: TObject) => {
      result += lineItem?.quantity || 1;

      return result;
    }, 0);
    const shouldShowOverflowError = totalQuantity > maxQuantity;
    const shouldShowUnderError = totalQuantity < minQuantity;

    return {
      shouldShowOverflowError,
      shouldShowUnderError,
      minQuantity,
    };
  }
  const { memberOrders = {} } = data;
  const { memberOrders: oldMemberOrders = {} } =
    oldOrderDetail?.[currentViewDate] || {};
  const oldTotalQuantity = Object.keys(oldMemberOrders).filter(
    (f) =>
      !!oldMemberOrders[f].foodId &&
      oldMemberOrders[f].status === EParticipantOrderStatus.joined,
  ).length;
  totalQuantity = Object.keys(memberOrders).filter(
    (f) =>
      !!memberOrders[f].foodId &&
      memberOrders[f].status === EParticipantOrderStatus.joined,
  ).length;
  const totalQuantityCanAdd = (totalQuantity * 10) / 100;
  const totalAdded = totalQuantity - oldTotalQuantity;
  const shouldShowOverflowError = totalAdded > totalQuantityCanAdd;

  const shouldShowUnderError = totalQuantity < minQuantity;

  return {
    shouldShowOverflowError,
    shouldShowUnderError,
    minQuantity,
  };
};

const OrderDetailPage = () => {
  const [viewMode, setViewMode] = useState<EPageViewMode>(EPageViewMode.edit);
  const intl = useIntl();
  const router = useRouter();
  const confirmCancelOrderActions = useBoolean(false);
  const dispatch = useAppDispatch();
  const inProgress = useAppSelector(orderDetailsAnyActionsInProgress);
  const { timestamp } = router.query;
  const [currentViewDate, setCurrentViewDate] = useState<number>(
    Number(timestamp),
  );

  const [showReachMaxAllowedChangesModal, setShowReachMaxAllowedChangesModal] =
    useState<'reach_max' | 'reach_min' | null>(null);

  const {
    query: { orderId },
    isReady: isRouterReady,
  } = router;

  const currentUser = useAppSelector((state) => state.user.currentUser);
  const cancelPickingOrderInProgress = useAppSelector(
    (state) => state.OrderManagement.cancelPickingOrderInProgress,
  );
  const orderData = useAppSelector((state) => state.OrderManagement.orderData);
  const isFetchingOrderDetails = useAppSelector(
    (state) => state.OrderManagement.isFetchingOrderDetails,
  );

  const {
    subOrderChangesHistory,
    lastRecordSubOrderChangesHistoryCreatedAt,
    querySubOrderChangesHistoryInProgress,
    subOrderChangesHistoryTotalItems,
    loadMoreSubOrderChangesHistory,
    draftOrderDetail,
    planData,
    draftSubOrderChangesHistory,
    transactionDataMap,
  } = useAppSelector((state) => state.OrderManagement);

  const { orderDetail = {} } = Listing(planData as TListing).getMetadata();
  const {
    orderTitle,
    editViewData,
    reviewViewData,
    priceQuotationData,
    setReviewInfoValues,
  } = usePrepareOrderDetailPageData();

  const handleCloseReachMaxAllowedChangesModal = () =>
    setShowReachMaxAllowedChangesModal(null);

  const handleOpenReachMaxAllowedChangesModal = (type: any) =>
    setShowReachMaxAllowedChangesModal(type);

  const plan = Listing(planData as TListing);

  const planId = plan.getId();

  const onQuerySubOrderHistoryChanges = useCallback(
    (lastRecordCreatedAt?: number) => {
      if (!planId || !orderId || !currentViewDate) return;

      return dispatch(
        orderManagementThunks.querySubOrderChangesHistory({
          orderId: orderId as string,
          planId,
          planOrderDate: currentViewDate,
          lastRecordCreatedAt,
        }),
      );
    },
    [planId, orderId, currentViewDate],
  );

  const onQueryMoreSubOrderChangesHistory = () => {
    if (lastRecordSubOrderChangesHistoryCreatedAt)
      return onQuerySubOrderHistoryChanges(
        lastRecordSubOrderChangesHistoryCreatedAt,
      );
  };

  const handleSetCurrentViewDate = (date: number) => {
    setCurrentViewDate(date);
    dispatch(OrderManagementsAction.resetDraftOrderDetails());
    dispatch(OrderManagementsAction.resetDraftSubOrderChangeHistory());
  };

  useEffect(() => {
    onQuerySubOrderHistoryChanges();
  }, [onQuerySubOrderHistoryChanges]);

  useEffect(() => {
    if (draftOrderDetail) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      () => {
        return dispatch(OrderManagementsAction.resetDraftOrderDetails());
      };
    }
  }, []);

  const handleDownloadPriceQuotation = useDownloadPriceQuotation(
    orderTitle,
    priceQuotationData,
  );

  const userId = CurrentUser(currentUser!).getId();
  const {
    orderState,
    bookerId,
    orderType = EOrderType.group,
  } = Listing(orderData as TListing).getMetadata();

  const isNormalOrder = orderType === EOrderType.normal;
  const isPicking = orderState === EOrderStates.picking;
  const isDraftEditing = orderState === EOrderStates.inProgress;

  const editViewClasses = classNames(css.editViewRoot, {
    [css.editNormalOrderView]: isNormalOrder,
    [css.editNormalOrderViewWithHistorySection]:
      isNormalOrder && isDraftEditing,
  });

  const handleConfirmOrder = async () => {
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

  const confirmButtonMessage = isPicking
    ? intl.formatMessage({
        id: 'EditView.OrderTitle.makeOrderButtonText',
      })
    : intl.formatMessage({
        id: 'EditView.OrderTitle.updateOrderButtonText',
      });

  const currentTxIsInitiated = txIsInitiated(
    transactionDataMap[currentViewDate],
  );

  const ableToUpdateOrder =
    !isFetchingOrderDetails &&
    isRouterReady &&
    ((currentTxIsInitiated &&
      isDraftEditing &&
      diffDays(currentViewDate, NOW, 'day') > ONE_DAY) ||
      isPicking);

  const orderDetailsNotChanged =
    isDraftEditing && isEqual(orderDetail, draftOrderDetail);

  const { shouldShowOverflowError, shouldShowUnderError, minQuantity } =
    checkMinMaxQuantity(
      draftOrderDetail,
      orderDetail,
      currentViewDate,
      isNormalOrder,
    );

  const EditViewComponent = (
    <div className={editViewClasses}>
      <OrderTitle
        className={css.titlePart}
        data={editViewData.titleSectionData}
        onConfirmOrder={handleConfirmOrder}
        onCancelOrder={confirmCancelOrderActions.setTrue}
        confirmButtonMessage={confirmButtonMessage}
        cancelButtonMessage={
          isPicking
            ? intl.formatMessage({
                id: 'EditView.OrderTitle.cancelOrderButtonText',
              })
            : ''
        }
        confirmDisabled={
          !isPicking &&
          (orderDetailsNotChanged ||
            shouldShowOverflowError ||
            shouldShowUnderError)
        }
        isDraftEditing={isDraftEditing}
      />

      <RenderWhen condition={!inProgress}>
        <RenderWhen condition={!isNormalOrder}>
          <div className={css.leftPart}>
            <ManageOrdersSection
              ableToUpdateOrder={ableToUpdateOrder}
              setCurrentViewDate={(date) => setCurrentViewDate(date)}
              currentViewDate={currentViewDate}
              isDraftEditing={isDraftEditing}
              handleOpenReachMaxAllowedChangesModal={
                handleOpenReachMaxAllowedChangesModal
              }
              shouldShowOverflowError={shouldShowOverflowError}
              shouldShowUnderError={shouldShowUnderError}
            />
          </div>
          <div className={css.rightPart}>
            <OrderDeadlineCountdownSection
              className={css.container}
              data={editViewData.countdownSectionData}
              ableToUpdateOrder={ableToUpdateOrder}
            />
            <OrderLinkSection
              className={css.container}
              data={editViewData.linkSectionData}
              ableToUpdateOrder={ableToUpdateOrder}
            />
            <ManageParticipantsSection
              className={css.container}
              data={editViewData.manageParticipantData}
              ableToUpdateOrder={ableToUpdateOrder}
            />
            {isDraftEditing && (
              <SubOrderChangesHistorySection
                className={css.container}
                querySubOrderChangesHistoryInProgress={
                  querySubOrderChangesHistoryInProgress
                }
                subOrderChangesHistory={subOrderChangesHistory}
                draftSubOrderChangesHistory={
                  draftSubOrderChangesHistory[
                    currentViewDate as unknown as keyof typeof draftSubOrderChangesHistory
                  ]
                }
                onQueryMoreSubOrderChangesHistory={
                  onQueryMoreSubOrderChangesHistory
                }
                subOrderChangesHistoryTotalItems={
                  subOrderChangesHistoryTotalItems
                }
                loadMoreSubOrderChangesHistory={loadMoreSubOrderChangesHistory}
              />
            )}
          </div>
          <div className={css.rightPart}>
            <OrderDeadlineCountdownSection
              className={css.container}
              data={editViewData.countdownSectionData}
              ableToUpdateOrder={ableToUpdateOrder}
            />
            <OrderLinkSection
              className={css.container}
              data={editViewData.linkSectionData}
              ableToUpdateOrder={ableToUpdateOrder}
            />
            <ManageParticipantsSection
              className={css.container}
              data={editViewData.manageParticipantData}
              ableToUpdateOrder={ableToUpdateOrder}
            />
            {isDraftEditing && (
              <SubOrderChangesHistorySection
                className={css.container}
                querySubOrderChangesHistoryInProgress={
                  querySubOrderChangesHistoryInProgress
                }
                subOrderChangesHistory={subOrderChangesHistory}
                draftSubOrderChangesHistory={
                  draftSubOrderChangesHistory[
                    currentViewDate as unknown as keyof typeof draftSubOrderChangesHistory
                  ]
                }
                onQueryMoreSubOrderChangesHistory={
                  onQueryMoreSubOrderChangesHistory
                }
                subOrderChangesHistoryTotalItems={
                  subOrderChangesHistoryTotalItems
                }
                loadMoreSubOrderChangesHistory={loadMoreSubOrderChangesHistory}
              />
            )}
          </div>
        </RenderWhen>
        <RenderWhen.False>
          <div
            className={
              isDraftEditing
                ? css.lineItemsTableWithSubOrderSection
                : css.lineItemsTable
            }>
            <ManageLineItemsSection
              data={editViewData.manageOrdersData}
              isDraftEditing={isDraftEditing}
              ableToUpdateOrder={ableToUpdateOrder}
              shouldShowOverflowError={shouldShowOverflowError}
              shouldShowUnderError={shouldShowUnderError}
              setCurrentViewDate={handleSetCurrentViewDate}
              currentViewDate={currentViewDate}
            />
            {isDraftEditing && (
              <SubOrderChangesHistorySection
                className={classNames(
                  css.container,
                  css.normalOrderSubOrderSection,
                )}
                querySubOrderChangesHistoryInProgress={
                  querySubOrderChangesHistoryInProgress
                }
                subOrderChangesHistory={subOrderChangesHistory}
                draftSubOrderChangesHistory={
                  draftSubOrderChangesHistory[
                    currentViewDate as unknown as keyof typeof draftSubOrderChangesHistory
                  ]
                }
                onQueryMoreSubOrderChangesHistory={
                  onQueryMoreSubOrderChangesHistory
                }
                subOrderChangesHistoryTotalItems={
                  subOrderChangesHistoryTotalItems
                }
                loadMoreSubOrderChangesHistory={loadMoreSubOrderChangesHistory}
              />
            )}
          </div>
        </RenderWhen.False>
      </RenderWhen>

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
      <ModalReachMaxAllowedChanges
        id="OrderDetailPage.ModalReachMaxAllowedChanges"
        isOpen={!!showReachMaxAllowedChangesModal}
        handleClose={handleCloseReachMaxAllowedChangesModal}
        type={showReachMaxAllowedChangesModal}
        minQuantity={minQuantity}
      />
    </div>
  );

  const ReviewViewComponent = (
    <ReviewView
      canGoBackEditMode
      reviewViewData={reviewViewData}
      onSubmitEdit={handleSubmitReviewInfoForm}
      onDownloadPriceQuotation={handleDownloadPriceQuotation}
      onGoBackToEditOrderPage={handleGoBackFromReviewMode}
      showStartPickingOrderButton
      orderData={orderData as TListing}
    />
  );

  useEffect(() => {
    if (
      isRouterReady &&
      !isFetchingOrderDetails &&
      isEmpty(bookerId) &&
      isEmpty(userId) &&
      userId !== bookerId
    ) {
      router.push({
        pathname: companyPaths.ManageOrders,
      });
    }
  }, [isRouterReady, bookerId, userId]);

  useEffect(() => {
    if (!isEmpty(orderState)) {
      setViewMode(
        ViewByOrderStates[orderState as keyof typeof ViewByOrderStates],
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
        case EOrderStates.inProgress:
          break;
        case EOrderDraftStates.draft:
          router.push(companyPaths.ManageOrders);
          break;
        default:
          break;
      }
    }
  }, [isRouterReady, orderState]);

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

export default OrderDetailPage;
