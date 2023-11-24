/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import Skeleton from 'react-loading-skeleton';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import { DateTime } from 'luxon';
import { useRouter } from 'next/router';

import IconNoteBook from '@components/Icons/IconNoteBook/IconNoteBook';
import IconNoteCheckList from '@components/Icons/IconNoteCheckList/IconNoteCheckList';
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
import { isOrderCreatedByBooker } from '@helpers/orderHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { useDownloadPriceQuotation } from '@hooks/useDownloadPriceQuotation';
import useExportOrderDetails from '@hooks/useExportOrderDetails';
import { usePrepareOrderDetailPageData } from '@hooks/usePrepareOrderManagementData';
import {
  orderDetailsAnyActionsInProgress,
  OrderManagementsAction,
  orderManagementThunks,
} from '@redux/slices/OrderManagement.slice';
import { companyPaths } from '@src/paths';
import { diffDays, formatTimestamp } from '@src/utils/dates';
import { FORMATTED_WEEKDAY } from '@src/utils/options';
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
  const confirmCancelOrderActions = useBoolean(false);
  const dispatch = useAppDispatch();
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
    orderType = EOrderType.group,
    orderVATPercentage,
    startDate,
    deliveryHour,
    orderStateHistory = [],
  } = Listing(orderData as TListing).getMetadata();
  const planId = Listing(planData as TListing).getId();
  const isPickingOrder = orderState === EOrderStates.picking;

  const normalizedDeliveryHour = deliveryHour?.includes('-')
    ? deliveryHour.split('-')[0]
    : deliveryHour;
  const automaticConfirmDate = DateTime.fromMillis(Number(startDate)).minus({
    days: 1,
  });
  const formattedAutomaticConfirmOrder = `${
    FORMATTED_WEEKDAY[automaticConfirmDate.weekday]
  }, ${formatTimestamp(automaticConfirmDate.toMillis(), 'dd/MM/yyyy')}`;

  const {
    planValidationsInProgressState,
    orderReachMaxCanModify: orderReachMaxCanModifyInProgressState,
    orderReachMaxRestaurantQuantity:
      orderReachMaxRestaurantQuantityInProgressState,
    orderReachMinRestaurantQuantity:
      orderReachMinRestaurantQuantityInProgressState,
  } = orderValidationsInProgressState || {};

  const planReachMaxRestaurantQuantityInProgressState =
    planValidationsInProgressState?.[currentViewDate]
      ?.planReachMaxRestaurantQuantity;

  const planReachMinRestaurantQuantityInProgressState =
    planValidationsInProgressState?.[currentViewDate]
      ?.planReachMinRestaurantQuantity;

  const planReachMaxCanModifyInProgressState =
    planValidationsInProgressState?.[currentViewDate]?.planReachMaxCanModify;

  const {
    orderTitle,
    editViewData,
    reviewViewData,
    priceQuotationData,
    setReviewInfoValues,
  } = usePrepareOrderDetailPageData({
    VATPercentage: isPickingOrder ? systemVATPercentage : orderVATPercentage,
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

  const handleDownloadPriceQuotation = useDownloadPriceQuotation({
    orderTitle,
    priceQuotationData,
  });

  const userId = CurrentUser(currentUser!).getId();

  const isNormalOrder = orderType === EOrderType.normal;
  const isPicking = orderState === EOrderStates.picking;
  const isDraftEditing = orderState === EOrderStates.inProgress;
  const isCreatedByBooker = isOrderCreatedByBooker(orderStateHistory);

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

  const handleConfirmOrder = async () => {
    setViewMode(EPageViewMode.review);
  };

  const handleGoBackFromReviewMode = () => {
    setViewMode(EPageViewMode.edit);
  };

  const handleSubmitReviewInfoForm = (_values: TReviewInfoFormValues) => {
    setReviewInfoValues(_values);
  };

  const onSaveOrderNote = (orderNote: string) => {
    return dispatch(
      orderManagementThunks.updateOrderGeneralInfo({
        orderNote,
      }),
    );
  };

  const { handler: onDownloadReviewOrderResults } = useExportOrderDetails();

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

  const { lastTransition = ETransition.INITIATE_TRANSACTION } =
    draftOrderDetail?.[currentViewDate] || {};

  const ableToUpdateOrder =
    !isFetchingOrderDetails &&
    isRouterReady &&
    ((lastTransition === ETransition.INITIATE_TRANSACTION &&
      isDraftEditing &&
      Number(diffDays(currentViewDate, NOW, 'day').days) > ONE_DAY) ||
      isPicking);

  const orderDetailsNotChanged = !checkOrderDetailHasChanged(
    draftSubOrderChangesHistory,
  );

  const {
    planValidations,
    orderReachMaxRestaurantQuantity,
    orderReachMinRestaurantQuantity,
  } = checkMinMaxQuantityInPickingState(
    isNormalOrder,
    isPicking,
    draftOrderDetail,
  );

  const {
    planReachMaxRestaurantQuantity:
      planReachMaxRestaurantQuantityInPickingState,
    planReachMinRestaurantQuantity:
      planReachMinRestaurantQuantityInPickingState,
  } = planValidations[currentViewDate as keyof typeof planValidations] || {};

  const disabledSubmit =
    orderReachMaxCanModifyInProgressState ||
    orderReachMaxRestaurantQuantity ||
    orderReachMinRestaurantQuantity ||
    orderReachMaxRestaurantQuantityInProgressState ||
    orderReachMinRestaurantQuantityInProgressState;

  const { minQuantity = 1 } =
    draftOrderDetail?.[currentViewDate]?.restaurant || {};

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
          disabledSubmit || (!isPicking && orderDetailsNotChanged)
        }
        isDraftEditing={isDraftEditing}
      />

      <RenderWhen condition={!inProgress}>
        <RenderWhen condition={!isNormalOrder}>
          <RenderWhen condition={isCreatedByBooker}>
            <div className={css.infoPart}>
              <div className={css.columnContainer}>
                <IconNoteCheckList />
                <div>
                  <div className={css.columnTitle}>Tự động đặt đơn</div>
                  <div>
                    Đơn sẽ được tự động đặt vào lúc{' '}
                    <b>
                      {normalizedDeliveryHour} {formattedAutomaticConfirmOrder}
                    </b>
                    . Trường hợp nếu đến hạn mà không đủ số lượng đặt món thì
                    đơn sẽ bị hủy.
                  </div>
                </div>
              </div>
              <div className={css.columnContainer}>
                <IconNoteBook />
                <div>
                  <div className={css.columnTitle}>
                    Tự động hủy tham gia cho thành viên
                  </div>
                  <div>
                    Nếu quá thời hạn mà thành viên chưa chọn món thì sẽ được xem
                    như là không tham gia ngày ăn.
                  </div>
                </div>
              </div>
            </div>
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
              planReachMaxRestaurantQuantity={
                planReachMaxRestaurantQuantityInPickingState ||
                planReachMaxRestaurantQuantityInProgressState
              }
              planReachMinRestaurantQuantity={
                planReachMinRestaurantQuantityInPickingState ||
                planReachMinRestaurantQuantityInProgressState
              }
            />
          </div>
          <div className={rightPartClasses}>
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
                shouldShowOverflowError={
                  planReachMaxRestaurantQuantityInProgressState ||
                  planReachMaxRestaurantQuantityInPickingState
                }
                shouldShowUnderError={
                  planReachMinRestaurantQuantityInProgressState ||
                  planReachMinRestaurantQuantityInPickingState
                }
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
                  loadMoreSubOrderChangesHistory={
                    loadMoreSubOrderChangesHistory
                  }
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
      onSaveOrderNote={onSaveOrderNote}
      onDownloadReviewOrderResults={onDownloadReviewOrderResults}
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
      orderId &&
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
