/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import Skeleton from 'react-loading-skeleton';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';

import IconNavbar from '@components/Icons/IconNavbar/IconNavbar';
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
import SidebarFeaturesHeader from '@components/SidebarFeaturesHeader/SidebarFeaturesHeader';
import Stepper from '@components/Stepper/Stepper';
import { checkMinMaxQuantityInPickingState } from '@helpers/order/orderPickingHelper';
import { checkOrderDetailHasChanged } from '@helpers/order/subOrderChangeAfterStartHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { useDownloadPriceQuotation } from '@hooks/useDownloadPriceQuotation';
import useExportOrderDetails from '@hooks/useExportOrderDetails';
import { usePrepareOrderDetailPageData } from '@hooks/usePrepareOrderManagementData';
import { useViewport } from '@hooks/useViewport';
import BookerStepperDesktopSection from '@pages/company/booker/orders/draft/[orderId]/components/BookerStepperDesktopSection/BookerStepperDesktopSection';
import {
  orderDetailsAnyActionsInProgress,
  OrderManagementsAction,
  orderManagementThunks,
} from '@redux/slices/OrderManagement.slice';
import { getStepsByOrderType } from '@src/constants/stepperSteps';
import { companyPaths } from '@src/paths';
import { diffDays } from '@src/utils/dates';
import { ETransition } from '@src/utils/transaction';
import { CurrentUser, Listing } from '@utils/data';
import { EOrderDraftStates, EOrderStates, EOrderType } from '@utils/enums';
import type { TListing } from '@utils/types';

import ModalReachMaxAllowedChanges from '../components/ModalReachMaxAllowedChanges/ModalReachMaxAllowedChanges';
import { useAutoPickFood } from '../hooks/useAutoPickFood';

import OrderQuantityErrorSection from './OrderQuantityErrorSection';

import css from './OrderDetail.module.scss';

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

const OrderDetailPage = () => {
  const [viewMode, setViewMode] = useState<EPageViewMode>(EPageViewMode.edit);
  const intl = useIntl();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isMobileLayout } = useViewport();
  const sendNotificationModalControl = useBoolean();
  const manageParticipantModalControl = useBoolean();
  const managePickingResultModalControl = useBoolean();
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
    orderType,
    orderVATPercentage,
    startDate,
    deliveryHour,
    isAutoPickFood,
  } = Listing(orderData as TListing).getMetadata();
  const planId = Listing(planData as TListing).getId();
  const userId = CurrentUser(currentUser!).getId();

  const { autoPickingAllowed, toggleFoodAutoPicking, isToggleingAutoPickFood } =
    useAutoPickFood(isAutoPickFood, String(orderId));

  const isAnyMobileModalOpening = moreOptionsModalControl.value;
  const isNormalOrder = orderType === EOrderType.normal;
  const isPickingOrder = orderState === EOrderStates.picking;
  const isDraftEditing = orderState === EOrderStates.inProgress;
  const isEditViewMode = viewMode === EPageViewMode.edit;
  const isViewCartDetailMode = viewMode === EPageViewMode.cartDetail;

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

  const editViewClasses = classNames(css.editViewRoot, {
    [css.editNormalOrderView]: isNormalOrder,
    [css.editNormalOrderViewWithHistorySection]:
      isNormalOrder && isDraftEditing,
  });

  const confirmButtonMessage = isPickingOrder
    ? editViewData.countdownSectionData.orderDeadline > 0
      ? 'Đặt đơn trước hạn'
      : intl.formatMessage({
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

  const handleConfirmOrder = async () => {
    setViewMode(EPageViewMode.review);
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

  const [collapseNavbar, setCollapseNavbar] = useState(false);

  const handleCollapseNavbar = useCallback(() => {
    setCollapseNavbar(!collapseNavbar);
  }, [collapseNavbar]);

  const handleCloseNavbar = useCallback(() => {
    setCollapseNavbar(false);
  }, [collapseNavbar]);

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
  const { minQuantity = 1, maxQuantity = 100 } = restaurant;

  const ableToUpdateOrder =
    !isFetchingOrderDetails &&
    isRouterReady &&
    (((lastTransition === ETransition.INITIATE_TRANSACTION ||
      lastTransition === ETransition.PARTNER_CONFIRM_SUB_ORDER) &&
      isDraftEditing &&
      Number(diffDays(currentViewDate, new Date().getTime(), 'hours').hours) >
        +process.env
          .NEXT_PUBLIC_MIN_OFFSET_TIME_TO_MODIFY_ORDER_DETAIL_IN_HOUR) ||
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

  const errorSection = (
    <OrderQuantityErrorSection
      planReachMaxCanModifyInProgressState={
        planReachMaxCanModifyInProgressState
      }
      planReachMaxRestaurantQuantity={planReachMaxRestaurantQuantity}
      planReachMinRestaurantQuantity={planReachMinRestaurantQuantity}
      maxQuantity={maxQuantity}
      minQuantity={minQuantity}
    />
  );

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
          <AutomaticStartOrInfoSection
            className={css.infoPart}
            startDate={startDate}
            deliveryHour={deliveryHour}
            mobileModalControl={automaticConfirmOrderMobileControl}
            autoPickingFormInitialValues={{
              autoPicking: autoPickingAllowed,
            }}
            disabled={isToggleingAutoPickFood}
            handleAutoPickingChange={toggleFoodAutoPicking}
          />
          <div className={css.leftPart}>
            <ManageOrdersSection
              ableToUpdateOrder={ableToUpdateOrder}
              setCurrentViewDate={handleSetCurrentViewDate}
              currentViewDate={currentViewDate}
              isDraftEditing={isDraftEditing}
              handleOpenReachMaxAllowedChangesModal={
                handleOpenReachMaxAllowedChangesModal
              }
              errorSection={errorSection}
            />
          </div>
          <ReviewOrdersResultModal
            isOpen={managePickingResultModalControl.value}
            onClose={managePickingResultModalControl.setFalse}
            data={reviewViewData.reviewResultData}
            onDownloadReviewOrderResults={onDownloadReviewOrderResults}
          />
          <div className={css.rightPart}>
            <OrderDeadlineCountdownSection
              className={css.container}
              data={editViewData.countdownSectionData}
              ableToUpdateOrder={ableToUpdateOrder}>
              <div className={css.autoPickingPart}>
                <AutomaticPickingForm
                  initialValues={{ autoPicking: autoPickingAllowed }}
                  handleFieldChange={toggleFoodAutoPicking}
                  onSubmit={() => {}}
                  subTitle=""
                  mainTitle="Tự động chọn món"
                />
              </div>
            </OrderDeadlineCountdownSection>

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
            <RenderWhen condition={!isMobileLayout && isDraftEditing}>
              <SubOrderChangesHistorySection
                className={css.container}
                {...subOrderChangesHistorySectionProps}
              />
            </RenderWhen>
          </div>

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
                setCurrentViewDate={handleSetCurrentViewDate}
                currentViewDate={currentViewDate}
                errorSection={errorSection}
              />

              <RenderWhen condition={!isMobileLayout && isDraftEditing}>
                <SubOrderChangesHistorySection
                  className={classNames(
                    css.container,
                    css.normalOrderSubOrderSection,
                  )}
                  {...subOrderChangesHistorySectionProps}
                />
              </RenderWhen>
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

  const _steps = getStepsByOrderType(orderType);

  const ReviewViewComponent = (
    <>
      {!!_steps.length && (
        <BookerStepperDesktopSection>
          <div className={css.stepperContainerDesktop}>
            <Stepper steps={_steps} currentStep={4} />
          </div>
        </BookerStepperDesktopSection>
      )}
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
    </>
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
    if (!isNormalOrder) {
      automaticConfirmOrderMobileControl.setTrue();
    }
  }, [isNormalOrder]);

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
    steps: _steps,
    currentStep: orderType === EOrderType.group ? 3 : 2,
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
      <div className={css.mobileTopActions}>
        <div className={css.mobileTopActionPart}>
          {goHomeIcon}
          <RenderWhen condition={!isNormalOrder}>{moreOptionsIcon}</RenderWhen>
        </div>
        <div className={css.actionIcon} onClick={handleCollapseNavbar}>
          <IconNavbar />
        </div>
      </div>
    ) : !isViewCartDetailMode ? (
      <div className={css.actionIcon} onClick={handleCollapseNavbar}>
        <IconNavbar />
      </div>
    ) : null,
  };

  switch (viewMode) {
    case EPageViewMode.edit:
      content = (
        <>
          {!!stepperProps.steps.length && (
            <BookerStepperDesktopSection>
              <Stepper className={css.stepper} {...stepperProps} />
            </BookerStepperDesktopSection>
          )}
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
      <SidebarFeaturesHeader
        collapseNavbar={collapseNavbar}
        handleCloseNavbar={handleCloseNavbar}
        companyId={router.query.companyId as string}
      />
      <MobileTopContainer {...mobileTopContainerProps} />
      {content}
    </>
  );
};

export default OrderDetailPage;
