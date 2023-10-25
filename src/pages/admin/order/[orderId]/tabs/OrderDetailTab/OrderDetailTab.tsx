/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import isEqual from 'lodash/isEqual';
import { useRouter } from 'next/router';

import ManageLineItemsSection from '@components/OrderDetails/EditView/ManageOrderDetailSection/ManageLineItemsSection';
import ManageOrdersSection from '@components/OrderDetails/EditView/ManageOrderDetailSection/ManageOrdersSection';
import ManageParticipantsSection from '@components/OrderDetails/EditView/ManageParticipantsSection/ManageParticipantsSection';
import OrderDeadlineCountdownSection from '@components/OrderDetails/EditView/OrderDeadlineCountdownSection/OrderDeadlineCountdownSection';
import OrderLinkSection from '@components/OrderDetails/EditView/OrderLinkSection/OrderLinkSection';
import SubOrderChangesHistorySection from '@components/OrderDetails/EditView/SubOrderChangesHistorySection/SubOrderChangesHistorySection';
import ReviewOrderStatesSection from '@components/OrderDetails/ReviewView/ReviewOrderStatesSection/ReviewOrderStatesSection';
import ReviewView from '@components/OrderDetails/ReviewView/ReviewView';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import Tabs from '@components/Tabs/Tabs';
import { groupFoodOrderByDate } from '@helpers/order/orderDetailHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { useDownloadPriceQuotation } from '@hooks/useDownloadPriceQuotation';
import useExportOrderDetails from '@hooks/useExportOrderDetails';
import { usePrepareOrderDetailPageData } from '@hooks/usePrepareOrderManagementData';
import { AdminManageOrderThunks } from '@pages/admin/order/AdminManageOrder.slice';
import { ReviewContent } from '@pages/admin/order/StepScreen/ReviewOrder/ReviewOrder';
import { checkMinMaxQuantityInPickingState } from '@pages/company/orders/[orderId]/picking/OrderDetail.page';
import {
  OrderManagementsAction,
  orderManagementThunks,
} from '@redux/slices/OrderManagement.slice';
import { Listing } from '@src/utils/data';
import { formatTimestamp } from '@src/utils/dates';
import { EOrderStates, EOrderType } from '@src/utils/enums';
import { ETransition } from '@src/utils/transaction';
import type { TListing, TObject, TUser } from '@src/utils/types';

import OrderHeaderInfor from '../../components/OrderHeaderInfor/OrderHeaderInfor';
import OrderHeaderState from '../../components/OrderHeaderState/OrderHeaderState';

import css from './OrderDetailTab.module.scss';

enum EPageViewMode {
  edit = 'edit',
  review = 'review',
  priceQuotation = 'priceQuotation',
}

type OrderDetailTabProps = {
  order: TListing;
  orderDetail: any;
  company: TUser;
  booker: TUser;
  updateStaffName: (staffName: string) => void;
  updateOrderStaffNameInProgress: boolean;
  updateOrderState: (newOrderState: string) => void;
  updateOrderStateInProgress: boolean;
  onSaveOrderNote: (orderNote: string) => void;
};

const OrderDetailTab: React.FC<OrderDetailTabProps> = (props) => {
  const {
    orderDetail,
    order,
    company,
    booker,
    updateStaffName,
    updateOrderStaffNameInProgress,
    updateOrderState,
    updateOrderStateInProgress,
    onSaveOrderNote,
  } = props;

  const {
    subOrderChangesHistory,
    lastRecordSubOrderChangesHistoryCreatedAt,
    querySubOrderChangesHistoryInProgress,
    subOrderChangesHistoryTotalItems,
    loadMoreSubOrderChangesHistory,
    draftOrderDetail,
    draftSubOrderChangesHistory,
    orderValidationsInProgressState,
    fetchOrderInProgress,
  } = useAppSelector((state) => state.OrderManagement);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const {
    query: { timestamp },
    isReady: isRouterReady,
  } = router;
  const [currentViewDate, setCurrentViewDate] = useState<number>(
    Number(timestamp),
  );

  const [viewMode, setViewMode] = useState<EPageViewMode>(EPageViewMode.edit);
  const [isDraftEditing, setIsDraftEditing] = useState<boolean>(false);
  const orderId = Listing(order).getId();
  const isEditMode = viewMode === EPageViewMode.edit;
  const { handler: onDownloadReviewOrderResults } = useExportOrderDetails();

  const { planValidationsInProgressState } =
    orderValidationsInProgressState || {};

  const planReachMaxRestaurantQuantityInProgressState =
    planValidationsInProgressState?.[currentViewDate]
      ?.planReachMaxRestaurantQuantity;

  const planReachMinRestaurantQuantityInProgressState =
    planValidationsInProgressState?.[currentViewDate]
      ?.planReachMinRestaurantQuantity;

  const planReachMaxCanModifyInProgressState =
    planValidationsInProgressState?.[currentViewDate]?.planReachMaxCanModify;

  const {
    notes,
    orderStateHistory = [],
    plans = [],
    orderState,
    orderType = EOrderType.group,
  } = Listing(order).getMetadata();
  const isGroupOrder = orderType === EOrderType.group;
  const isPickingState = orderState === EOrderStates.picking;
  const planId = plans.length > 0 ? plans[0] : undefined;
  const showStateSectionCondition =
    orderStateHistory.findIndex(({ state }: { state: EOrderStates }) => {
      return state === EOrderStates.inProgress;
    }) > 0;
  const orderDetailsNotChanged =
    isDraftEditing && isEqual(orderDetail, draftOrderDetail);

  const { lastTransition = ETransition.INITIATE_TRANSACTION } =
    draftOrderDetail?.[currentViewDate] || {};

  const ableToUpdateOrder =
    !fetchOrderInProgress &&
    isRouterReady &&
    ((lastTransition === ETransition.INITIATE_TRANSACTION && isDraftEditing) ||
      isPickingState);

  const { orderTitle, priceQuotationData, editViewData, reviewViewData } =
    // eslint-disable-next-line react-hooks/rules-of-hooks
    usePrepareOrderDetailPageData({
      isAdminLayout: true,
    });

  const handleDownloadPriceQuotation = useDownloadPriceQuotation({
    orderTitle,
    priceQuotationData,
  });

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

  const tabItems = useMemo(
    () => {
      const foodOrderGroupedByDate = groupFoodOrderByDate({
        orderDetail,
        isGroupOrder,
      });

      return Object.keys(orderDetail).map((key: string) => {
        const foodOrder = foodOrderGroupedByDate.find(
          ({ date }) => date === key,
        );

        const updatePlanDetail = (updateData: TObject, skipRefetch = false) => {
          if (planId) {
            dispatch(
              AdminManageOrderThunks.updatePlanDetail({
                planId,
                orderId,
                orderDetail: {
                  ...orderDetail,
                  [key]: { ...orderDetail[key], ...updateData },
                },
                skipRefetch,
              }),
            );
          }
        };

        return {
          id: key,
          key,
          label: formatTimestamp(Number(key)),
          childrenFn: (childProps: any) => <ReviewContent {...childProps} />,
          childrenProps: {
            ...orderDetail[key],
            notes,
            updatePlanDetail,
            timeStamp: key,
            foodOrder,
            onDownloadReviewOrderResults,
          },
        };
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(order), JSON.stringify(orderDetail)],
  );
  const defaultActiveKey = tabItems.findIndex(({ id }) => id === timestamp);

  const handleConfirmOrder = () => {
    setViewMode(EPageViewMode.review);
  };

  const handleGoBackFromReviewMode = () => {
    setViewMode(EPageViewMode.edit);
  };

  const handleUpdateOrderState = (state: EOrderStates) => () => {
    updateOrderState(state);
  };

  const turnOnDraftEditMode = () => {
    setIsDraftEditing(true);
  };

  const handleSetCurrentViewDate = (date: number) => {
    setCurrentViewDate(date);
  };

  const onQueryMoreSubOrderChangesHistory = () => {
    if (lastRecordSubOrderChangesHistoryCreatedAt)
      return onQuerySubOrderHistoryChanges(
        lastRecordSubOrderChangesHistoryCreatedAt,
      );
  };

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

  const isNormalOrder = orderType === EOrderType.normal;

  const { planValidations } = checkMinMaxQuantityInPickingState(
    isNormalOrder,
    isPickingState,
    draftOrderDetail,
  );

  const {
    planReachMaxRestaurantQuantity:
      planReachMaxRestaurantQuantityInPickingState,
    planReachMinRestaurantQuantity:
      planReachMinRestaurantQuantityInPickingState,
  } = planValidations[currentViewDate as keyof typeof planValidations] || {};

  const { minQuantity = 1 } =
    draftOrderDetail?.[currentViewDate]?.restaurant || {};

  return (
    <div className={css.container}>
      <RenderWhen condition={isEditMode}>
        <OrderHeaderState
          order={order}
          handleUpdateOrderState={handleUpdateOrderState}
          updateOrderStateInProgress={updateOrderStateInProgress}
          onConfirmOrder={handleConfirmOrder}
          isDraftEditing={isDraftEditing}
          turnOnDraftEditMode={turnOnDraftEditMode}
          confirmUpdateDisabled={orderDetailsNotChanged}
          isAdminFlow
        />
        <RenderWhen condition={showStateSectionCondition}>
          <ReviewOrderStatesSection
            data={{ orderDetail, isCanceledOrder: false }}
            isAdminLayout
            className={css.reviewOrderStates}
          />
        </RenderWhen>
        <OrderHeaderInfor
          company={company}
          booker={booker}
          order={order}
          updateStaffName={updateStaffName}
          updateOrderStaffNameInProgress={updateOrderStaffNameInProgress}
          containerClassName={css.orderInforWrapper}
        />

        <div className={css.orderDetailWrapper}>
          <RenderWhen condition={isPickingState || isDraftEditing}>
            <RenderWhen condition={isGroupOrder}>
              <div className={css.editViewRoot}>
                <div className={css.leftPart}>
                  <ManageOrdersSection
                    setCurrentViewDate={(date) => setCurrentViewDate(date)}
                    currentViewDate={currentViewDate}
                    isDraftEditing={isDraftEditing}
                    ableToUpdateOrder={ableToUpdateOrder}
                    planReachMaxCanModify={planReachMaxCanModifyInProgressState}
                    planReachMaxRestaurantQuantity={
                      planReachMaxRestaurantQuantityInPickingState ||
                      planReachMaxRestaurantQuantityInProgressState
                    }
                    planReachMinRestaurantQuantity={
                      planReachMinRestaurantQuantityInPickingState ||
                      planReachMinRestaurantQuantityInProgressState
                    }
                    isAdminFlow
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
                    isAminLayout
                    ableToUpdateOrder={ableToUpdateOrder}
                  />
                  <ManageParticipantsSection
                    className={css.container}
                    data={editViewData.manageParticipantData}
                    ableToUpdateOrder={ableToUpdateOrder}
                  />
                  <RenderWhen condition={isDraftEditing}>
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
                      loadMoreSubOrderChangesHistory={
                        loadMoreSubOrderChangesHistory
                      }
                    />
                  </RenderWhen>
                </div>
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
                    isAdminFlow
                  />
                  <RenderWhen condition={isDraftEditing}>
                    <SubOrderChangesHistorySection
                      className={classNames(
                        css.historyContainer,
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
                  </RenderWhen>
                </div>
              </RenderWhen.False>
            </RenderWhen>

            <RenderWhen.False>
              <Tabs
                items={tabItems as any}
                defaultActiveKey={`${
                  (defaultActiveKey < 0 ? 0 : defaultActiveKey) + 1
                }`}
              />
            </RenderWhen.False>
          </RenderWhen>
        </div>

        <RenderWhen.False>
          <ReviewView
            className={css.reviewViewRoot}
            classes={{
              leftClassName: css.leftPart,
              rightClassName: css.rightPart,
            }}
            canGoBackEditMode
            reviewViewData={reviewViewData}
            onSubmitEdit={() => {}}
            onDownloadPriceQuotation={handleDownloadPriceQuotation}
            onGoBackToEditOrderPage={handleGoBackFromReviewMode}
            onDownloadReviewOrderResults={onDownloadReviewOrderResults}
            showStartPickingOrderButton
            isAdminLayout
            onSaveOrderNote={onSaveOrderNote}
          />
        </RenderWhen.False>
      </RenderWhen>
    </div>
  );
};

export default OrderDetailTab;
