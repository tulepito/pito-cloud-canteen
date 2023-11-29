/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import Skeleton from 'react-loading-skeleton';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';

import MobileTopContainer from '@components/MobileTopContainer/MobileTopContainer';
import AlertModal from '@components/Modal/AlertModal';
import AutomaticPickingForm from '@components/OrderDetails/EditView/AutomaticInfoSection/AutomaticPickingForm';
import AutomaticStartOrInfoSection from '@components/OrderDetails/EditView/AutomaticInfoSection/AutomaticStartOrInfoSection';
import GoHomeIcon from '@components/OrderDetails/EditView/GoHomeIcon/GoHomeIcon';
import ManageLineItemsSection from '@components/OrderDetails/EditView/ManageOrderDetailSection/ManageLineItemsSection';
import ManageOrdersSection from '@components/OrderDetails/EditView/ManageOrderDetailSection/ManageOrdersSection';
import ManageParticipantsSection from '@components/OrderDetails/EditView/ManageParticipantsSection/ManageParticipantsSection';
import MoreOptionsIcon from '@components/OrderDetails/EditView/MoreOptionsIcon/MoreOptionsIcon';
import OrderDeadlineCountdownSection from '@components/OrderDetails/EditView/OrderDeadlineCountdownSection/OrderDeadlineCountdownSection';
import OrderLinkSection from '@components/OrderDetails/EditView/OrderLinkSection/OrderLinkSection';
import OrderTitle from '@components/OrderDetails/EditView/OrderTitle/OrderTitle';
import SubOrderChangesHistorySection from '@components/OrderDetails/EditView/SubOrderChangesHistorySection/SubOrderChangesHistorySection';
import type { TReviewInfoFormValues } from '@components/OrderDetails/ReviewView/ReviewInfoSection/ReviewInfoForm';
import ReviewOrdersResultModal from '@components/OrderDetails/ReviewView/ReviewOrdersResultSection/ReviewOrdersResultModal';
import ReviewView from '@components/OrderDetails/ReviewView/ReviewView';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import Stepper from '@components/Stepper/Stepper';
import { isOrderCreatedByBooker } from '@helpers/orderHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { useDownloadPriceQuotation } from '@hooks/useDownloadPriceQuotation';
import useExportOrderDetails from '@hooks/useExportOrderDetails';
import { usePrepareOrderDetailPageData } from '@hooks/usePrepareOrderManagementData';
import { useViewport } from '@hooks/useViewport';
import {
  orderDetailsAnyActionsInProgress,
  OrderManagementsAction,
  orderManagementThunks,
} from '@redux/slices/OrderManagement.slice';
import { BOOKER_CREATE_GROUP_ORDER_STEPS } from '@src/constants/stepperSteps';
import { companyPaths } from '@src/paths';
import { diffDays } from '@src/utils/dates';
import type { TPlan } from '@src/utils/orderTypes';
import { ETransition } from '@src/utils/transaction';
import { CurrentUser, Listing } from '@utils/data';
import {
  EOrderDraftStates,
  EOrderStates,
  EOrderType,
  EParticipantOrderStatus,
} from '@utils/enums';
import type {
  TListing,
  TObject,
  TSubOrderChangeHistoryItem,
} from '@utils/types';

import ModalReachMaxAllowedChanges from '../components/ModalReachMaxAllowedChanges/ModalReachMaxAllowedChanges';

import css from './OrderDetail.module.scss';

const checkOrderDetailHasChanged = (
  draftSubOrderChangesHistory: Record<string, TSubOrderChangeHistoryItem[]>,
) => {
  return Object.keys(draftSubOrderChangesHistory).some((dateAsTimeStamp) => {
    return draftSubOrderChangesHistory[dateAsTimeStamp].length > 0;
  });
};

export const checkMinMaxQuantityInPickingState = (
  isNormalOrder: boolean,
  isPicking: boolean,
  orderDetail: TPlan['orderDetail'] = {},
) => {
  if (!isPicking) {
    return {
      planValidations: {},
      orderReachMaxRestaurantQuantity: false,
      orderReachMinRestaurantQuantity: false,
    };
  }
  let planValidations = {};
  if (isNormalOrder) {
    planValidations = Object.keys(orderDetail).reduce(
      (prev: any, dateAsTimeStamp) => {
        const currentOrderDetails = orderDetail[dateAsTimeStamp];
        const { lineItems = [], restaurant = {} } = currentOrderDetails || {};
        const { maxQuantity = 100, minQuantity = 1 } = restaurant || {};
        const totalAdded = lineItems.reduce(
          (result: number, lineItem: TObject) => {
            result += lineItem?.quantity || 1;

            return result;
          },
          0,
        );

        return {
          ...prev,
          [dateAsTimeStamp]: {
            planReachMinRestaurantQuantity: totalAdded < minQuantity,
            planReachMaxRestaurantQuantity: totalAdded > maxQuantity,
          },
        };
      },
      {},
    );
  } else {
    planValidations = Object.keys(orderDetail).reduce(
      (prev: any, dateAsTimeStamp) => {
        const currentOrderDetails = orderDetail[dateAsTimeStamp] || {};
        const { memberOrders = {}, restaurant = {} } = currentOrderDetails;
        const { minQuantity = 0, maxQuantity = 100 } = restaurant;
        const totalAdded = Object.keys(memberOrders).filter(
          (f) =>
            !!memberOrders[f].foodId &&
            memberOrders[f].status === EParticipantOrderStatus.joined,
        ).length;

        return {
          ...prev,
          [dateAsTimeStamp]: {
            planReachMinRestaurantQuantity: totalAdded < minQuantity,
            planReachMaxRestaurantQuantity: totalAdded > maxQuantity,
          },
        };
      },
      {},
    );
  }
  const orderReachMinRestaurantQuantity = Object.keys(planValidations).some(
    (dateAsTimeStamp) => {
      const { planReachMinRestaurantQuantity } =
        planValidations[dateAsTimeStamp as keyof typeof planValidations] || {};

      return planReachMinRestaurantQuantity;
    },
  );
  const orderReachMaxRestaurantQuantity = Object.keys(planValidations).some(
    (dateAsTimeStamp) => {
      const { planReachMaxRestaurantQuantity } =
        planValidations[dateAsTimeStamp as keyof typeof planValidations];

      return planReachMaxRestaurantQuantity;
    },
  );

  return {
    planValidations,
    orderReachMaxRestaurantQuantity,
    orderReachMinRestaurantQuantity,
  };
};

enum EPageViewMode {
  edit = 'edit',
  review = 'review',
  priceQuotation = 'priceQuotation',
  cartDetail = 'cartDetail',
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

const OrderDetailPage = () => {
  const [viewMode, setViewMode] = useState<EPageViewMode>(EPageViewMode.edit);
  const intl = useIntl();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isMobileLayout } = useViewport();
  const sendNotificationModalControl = useBoolean();
  const manageParticipantModalControl = useBoolean();
  const managePickingResultModalControl = useBoolean();
  const autoPickingControl = useBoolean();
  const automaticConfirmOrderMobileControl = useBoolean();
  const confirmCancelOrderActions = useBoolean();
  const inProgress = useAppSelector(orderDetailsAnyActionsInProgress);
  const {
    query: { orderId, timestamp },
    isReady: isRouterReady,
  } = router;
  const [currentViewDate, setCurrentViewDate] = useState<number>(
    Number(timestamp),
  );
  const [showReachMaxAllowedChangesModal, setShowReachMaxAllowedChangesModal] =
    useState<'reach_max' | 'reach_min' | null>(null);
  const confirmGoHomeControl = useBoolean();
  const moreOptionsModalControl = useBoolean();
  const { handler: onDownloadReviewOrderResults } = useExportOrderDetails();
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const cancelPickingOrderInProgress = useAppSelector(
    (state) => state.OrderManagement.cancelPickingOrderInProgress,
  );
  const orderData = useAppSelector((state) => state.OrderManagement.orderData);
  const systemVATPercentage = useAppSelector(
    (state) => state.SystemAttributes.systemVATPercentage,
  );
  const isFetchingOrderDetails = useAppSelector(
    (state) => state.OrderManagement.fetchOrderInProgress,
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
    orderValidationsInProgressState,
  } = useAppSelector((state) => state.OrderManagement);
  const {
    orderState,
    bookerId,
    orderType = EOrderType.normal,
    orderVATPercentage,
    startDate,
    deliveryHour,
    orderStateHistory = [],
  } = Listing(orderData as TListing).getMetadata();

  const isAnyMobileModalOpening = moreOptionsModalControl.value;
  const isNormalOrder = orderType === EOrderType.normal;
  const isPickingOrder = orderState === EOrderStates.picking;
  const isDraftEditing = orderState === EOrderStates.inProgress;
  const isEditViewMode = viewMode === EPageViewMode.edit;
  const isViewCartDetailMode = viewMode === EPageViewMode.cartDetail;
  const isCreatedByBooker = isOrderCreatedByBooker(orderStateHistory);

  const planId = Listing(planData as TListing).getId();

  const {
    planValidationsInProgressState,
    orderReachMaxCanModify: orderReachMaxCanModifyInProgressState,
    orderReachMaxRestaurantQuantity:
      orderReachMaxRestaurantQuantityInProgressState,
    orderReachMinRestaurantQuantity:
      orderReachMinRestaurantQuantityInProgressState,
  } = orderValidationsInProgressState || {};

  const {
    planReachMaxRestaurantQuantity:
      planReachMaxRestaurantQuantityInProgressState,
    planReachMinRestaurantQuantity:
      planReachMinRestaurantQuantityInProgressState,
    planReachMaxCanModify: planReachMaxCanModifyInProgressState,
  } = planValidationsInProgressState?.[currentViewDate] || {};

  const {
    planValidations,
    orderReachMaxRestaurantQuantity,
    orderReachMinRestaurantQuantity,
  } = checkMinMaxQuantityInPickingState(
    isNormalOrder,
    isPickingOrder,
    draftOrderDetail,
  );

  const {
    planReachMaxRestaurantQuantity:
      planReachMaxRestaurantQuantityInPickingState,
    planReachMinRestaurantQuantity:
      planReachMinRestaurantQuantityInPickingState,
  } = planValidations[currentViewDate as keyof typeof planValidations] || {};

  const planReachMaxRestaurantQuantity =
    planReachMaxRestaurantQuantityInProgressState ||
    planReachMaxRestaurantQuantityInPickingState;
  const planReachMinRestaurantQuantity =
    planReachMinRestaurantQuantityInProgressState ||
    planReachMinRestaurantQuantityInPickingState;

  const {
    orderTitle,
    editViewData,
    reviewViewData,
    priceQuotationData,
    reviewInfoValues,
    setReviewInfoValues,
  } = usePrepareOrderDetailPageData({
    VATPercentage: isPickingOrder ? systemVATPercentage : orderVATPercentage,
  });

  const userId = CurrentUser(currentUser!).getId();

  const editViewClasses = classNames(css.editViewRoot, {
    [css.editNormalOrderView]: isNormalOrder,
    [css.editNormalOrderViewWithHistorySection]:
      isNormalOrder && isDraftEditing,
  });
  const leftPartClasses = classNames(css.leftPart, {
    [css.leftPartWithInfo]: isCreatedByBooker,
  });
  const rightPartClasses = classNames(css.rightPart, {
    [css.rightPartWithInfo]: isCreatedByBooker,
  });

  const confirmButtonMessage = isPickingOrder
    ? intl.formatMessage({
        id: 'EditView.OrderTitle.makeOrderButtonText',
      })
    : intl.formatMessage({
        id: 'EditView.OrderTitle.updateOrderButtonText',
      });

  const handleCloseReachMaxAllowedChangesModal = () =>
    setShowReachMaxAllowedChangesModal(null);

  const handleOpenReachMaxAllowedChangesModal = (type: any) =>
    setShowReachMaxAllowedChangesModal(type);

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
  };

  const handleDownloadPriceQuotation = useDownloadPriceQuotation({
    orderTitle,
    priceQuotationData,
  });

  const handleConfirmOrder = async () => {
    setViewMode(EPageViewMode.review);
  };
  const handleGoBackFromReviewMode = () => {
    setViewMode(EPageViewMode.edit);
  };
  const handleGoBackFromViewCartDetailMode = () => {
    setViewMode(EPageViewMode.review);
  };
  const handleViewCartDetail = () => {
    setViewMode(EPageViewMode.cartDetail);
  };

  const handleEditReviewInfoForm = (
    {
      contactPeopleName = '',
      contactPhoneNumber = '',
      ...restValues
    }: TReviewInfoFormValues,
    invalid: boolean,
  ) => {
    setReviewInfoValues({
      contactPeopleName,
      contactPhoneNumber,
      ...restValues,
      invalid,
    });
  };

  const onSaveOrderNote = (orderNote: string) => {
    return dispatch(
      orderManagementThunks.updateOrderGeneralInfo({
        orderNote,
      }),
    );
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

  const subOrderChangesHistorySectionProps = {
    querySubOrderChangesHistoryInProgress,
    subOrderChangesHistory,
    draftSubOrderChangesHistory:
      draftSubOrderChangesHistory[
        currentViewDate as unknown as keyof typeof draftSubOrderChangesHistory
      ],
    onQueryMoreSubOrderChangesHistory,
    subOrderChangesHistoryTotalItems,
    loadMoreSubOrderChangesHistory,
  };

  const { lastTransition = ETransition.INITIATE_TRANSACTION, restaurant = {} } =
    draftOrderDetail?.[currentViewDate] || {};
  const { minQuantity = 1 } = restaurant;

  const ableToUpdateOrder =
    !isFetchingOrderDetails &&
    isRouterReady &&
    ((lastTransition === ETransition.INITIATE_TRANSACTION &&
      isDraftEditing &&
      Number(diffDays(currentViewDate, NOW, 'day').days) > ONE_DAY) ||
      isPickingOrder);

  const orderDetailsNotChanged = !checkOrderDetailHasChanged(
    draftSubOrderChangesHistory,
  );

  const disabledSubmit =
    orderReachMaxCanModifyInProgressState ||
    orderReachMaxRestaurantQuantity ||
    orderReachMinRestaurantQuantity ||
    orderReachMaxRestaurantQuantityInProgressState ||
    orderReachMinRestaurantQuantityInProgressState;

  const EditViewComponent = (
    <div className={editViewClasses}>
      <RenderWhen condition={!inProgress}>
        <OrderTitle
          className={css.titlePart}
          data={editViewData.titleSectionData}
          onConfirmOrder={handleConfirmOrder}
          onCancelOrder={confirmCancelOrderActions.setTrue}
          confirmButtonMessage={confirmButtonMessage}
          cancelButtonMessage={
            isPickingOrder
              ? intl.formatMessage({
                  id: 'EditView.OrderTitle.cancelOrderButtonText',
                })
              : ''
          }
          cancelDisabled={confirmGoHomeControl.value}
          confirmDisabled={
            confirmGoHomeControl.value ||
            disabledSubmit ||
            (!isPickingOrder && orderDetailsNotChanged)
          }
          isDraftEditing={isDraftEditing}
          shouldHideBottomContainer={isAnyMobileModalOpening}
        />
        <RenderWhen condition={!isNormalOrder}>
          <RenderWhen condition={isCreatedByBooker}>
            <AutomaticStartOrInfoSection
              className={css.infoPart}
              startDate={startDate}
              deliveryHour={deliveryHour}
              mobileModalControl={automaticConfirmOrderMobileControl}
              autoPickingFormInitialValues={{
                autoPicking: autoPickingControl.value,
              }}
              handleAutoPickingChange={autoPickingControl.toggle}
            />
          </RenderWhen>
          <div className={leftPartClasses}>
            <ManageOrdersSection
              ableToUpdateOrder={ableToUpdateOrder}
              setCurrentViewDate={handleSetCurrentViewDate}
              currentViewDate={currentViewDate}
              isDraftEditing={isDraftEditing}
              handleOpenReachMaxAllowedChangesModal={
                handleOpenReachMaxAllowedChangesModal
              }
              planReachMaxCanModify={planReachMaxCanModifyInProgressState}
              planReachMaxRestaurantQuantity={planReachMaxRestaurantQuantity}
              planReachMinRestaurantQuantity={planReachMinRestaurantQuantity}
            />
          </div>
          <ReviewOrdersResultModal
            isOpen={managePickingResultModalControl.value}
            onClose={managePickingResultModalControl.setFalse}
            data={reviewViewData.reviewResultData}
            onDownloadReviewOrderResults={handleDownloadPriceQuotation}
          />
          <div className={rightPartClasses}>
            <OrderDeadlineCountdownSection
              className={css.container}
              data={editViewData.countdownSectionData}
              ableToUpdateOrder={ableToUpdateOrder}
            />
            <OrderLinkSection
              className={css.mobileContainer}
              data={editViewData.linkSectionData}
              ableToUpdateOrder={ableToUpdateOrder}
              shouldHideOnMobileView
              mobileModalControl={sendNotificationModalControl}
            />
            <ManageParticipantsSection
              className={css.mobileContainer}
              data={editViewData.manageParticipantData}
              ableToUpdateOrder={ableToUpdateOrder}
              shouldHideOnMobileView
              mobileModalControl={manageParticipantModalControl}
            />
            {isDraftEditing && (
              <SubOrderChangesHistorySection
                className={css.container}
                {...subOrderChangesHistorySectionProps}
              />
            )}
          </div>
          <RenderWhen condition={isCreatedByBooker}>
            <div className={css.autoPickingPart}>
              <AutomaticPickingForm
                initialValues={{ autoPicking: autoPickingControl.value }}
                handleFieldChange={autoPickingControl.toggle}
                onSubmit={() => {}}
              />
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
                isDraftEditing={isDraftEditing}
                ableToUpdateOrder={ableToUpdateOrder}
                shouldShowOverflowError={planReachMaxRestaurantQuantity}
                shouldShowUnderError={planReachMinRestaurantQuantity}
                setCurrentViewDate={handleSetCurrentViewDate}
                currentViewDate={currentViewDate}
                minQuantity={minQuantity}
              />
              {isDraftEditing && (
                <SubOrderChangesHistorySection
                  className={classNames(
                    css.container,
                    css.normalOrderSubOrderSection,
                  )}
                  {...subOrderChangesHistorySectionProps}
                />
              )}
            </div>
          </RenderWhen.False>
        </RenderWhen>
        <RenderWhen.False>
          <div className={css.loadingContainer}>
            <Skeleton className={css.loadingContent} />
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
        shouldFullScreenInMobile={false}
        containerClassName={css.confirmCancelOrderModalContainer}
        headerClassName={css.confirmCancelOrderModalHeader}
        childrenClassName={css.confirmCancelOrderModalChildren}
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
      isViewCartDetailMode={isViewCartDetailMode}
      canGoBackEditMode
      reviewViewData={reviewViewData}
      setInfoFormValues={handleEditReviewInfoForm}
      onDownloadPriceQuotation={handleDownloadPriceQuotation}
      onGoBackToEditOrderPage={handleGoBackFromReviewMode}
      onViewCartDetail={handleViewCartDetail}
      showStartPickingOrderButton
      onSaveOrderNote={onSaveOrderNote}
      onDownloadReviewOrderResults={onDownloadReviewOrderResults}
      orderData={orderData as TListing}
      priceQuotationData={priceQuotationData}
      reviewInfoValues={reviewInfoValues}
    />
  );

  useEffect(() => {
    if (
      planReachMaxRestaurantQuantityInProgressState ||
      planReachMinRestaurantQuantityInProgressState ||
      planReachMaxCanModifyInProgressState
    ) {
      const i = setTimeout(() => {
        dispatch(OrderManagementsAction.resetOrderDetailValidation());
        clearTimeout(i);
      }, 4000);
    }
  }, [
    planReachMaxRestaurantQuantityInProgressState,
    planReachMinRestaurantQuantityInProgressState,
    planReachMaxCanModifyInProgressState,
  ]);

  useEffect(() => {
    onQuerySubOrderHistoryChanges();
  }, [onQuerySubOrderHistoryChanges]);

  useEffect(() => {
    if (draftOrderDetail) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      () => {
        dispatch(OrderManagementsAction.resetDraftSubOrderChangeHistory());

        return dispatch(OrderManagementsAction.resetDraftOrderDetails());
      };
    }
  }, []);

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

      if (
        isRouterReady &&
        orderId &&
        !BookerAccessibleOrderStates.includes(orderState)
      ) {
        router.push({
          pathname: companyPaths.ManageOrderDetail,
          query: { orderId },
        });
      }
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

  useEffect(() => {
    if (isViewCartDetailMode && !isMobileLayout) {
      setViewMode(EPageViewMode.review);
    }
  }, [isMobileLayout, isViewCartDetailMode]);

  useEffect(() => {
    if (isCreatedByBooker && !isNormalOrder) {
      automaticConfirmOrderMobileControl.setTrue();
    }
  }, []);

  const goHomeIcon = <GoHomeIcon control={confirmGoHomeControl} />;
  const moreOptionsIcon = (
    <MoreOptionsIcon
      control={moreOptionsModalControl}
      options={[
        {
          content: 'Danh sách thành viên',
          onClick: manageParticipantModalControl.setTrue,
        },
        {
          content: 'Chia sẻ liên kết đặt hàng',
          onClick: sendNotificationModalControl.setTrue,
        },
        {
          content: 'Kết quả chọn món',
          onClick: managePickingResultModalControl.setTrue,
        },
      ]}
    />
  );
  let content = null;
  const stepperProps = {
    steps: BOOKER_CREATE_GROUP_ORDER_STEPS,
    currentStep: 3,
  };
  const mobileTopContainerProps = {
    title: isEditViewMode
      ? 'Quản lý chọn món'
      : isViewCartDetailMode
      ? 'Giỏ hàng của bạn'
      : 'Xem lại thông tin đơn hàng',
    hasGoBackButton: !isEditViewMode || isViewCartDetailMode,
    onGoBack: isViewCartDetailMode
      ? handleGoBackFromViewCartDetailMode
      : handleGoBackFromReviewMode,
    actionPart: isEditViewMode ? (
      <div className={css.mobileTopActionPart}>
        {goHomeIcon}
        <RenderWhen condition={!isNormalOrder}>{moreOptionsIcon}</RenderWhen>
      </div>
    ) : null,
  };

  switch (viewMode) {
    case EPageViewMode.edit:
      content = (
        <>
          <RenderWhen condition={!isNormalOrder}>
            <Stepper {...stepperProps} />
          </RenderWhen>
          {EditViewComponent}
        </>
      );
      break;
    case EPageViewMode.review:
    default:
      content = ReviewViewComponent;
      break;
  }

  return (
    <>
      <MobileTopContainer {...mobileTopContainerProps} />

      {content}
    </>
  );
};

export default OrderDetailPage;
