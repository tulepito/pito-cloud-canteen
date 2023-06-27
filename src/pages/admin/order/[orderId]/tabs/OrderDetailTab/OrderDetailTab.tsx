import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

import ManageLineItemsSection from '@components/OrderDetails/EditView/ManageOrderDetailSection/ManageLineItemsSection';
import ManageOrdersSection from '@components/OrderDetails/EditView/ManageOrderDetailSection/ManageOrdersSection';
import ManageParticipantsSection from '@components/OrderDetails/EditView/ManageParticipantsSection/ManageParticipantsSection';
import OrderDeadlineCountdownSection from '@components/OrderDetails/EditView/OrderDeadlineCountdownSection/OrderDeadlineCountdownSection';
import OrderLinkSection from '@components/OrderDetails/EditView/OrderLinkSection/OrderLinkSection';
import ReviewOrderStatesSection from '@components/OrderDetails/ReviewView/ReviewOrderStatesSection/ReviewOrderStatesSection';
import ReviewView from '@components/OrderDetails/ReviewView/ReviewView';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import Tabs from '@components/Tabs/Tabs';
import { groupFoodOrderByDate } from '@helpers/order/orderDetailHelper';
import { useAppDispatch } from '@hooks/reduxHooks';
import { useDownloadPriceQuotation } from '@hooks/useDownloadPriceQuotation';
import useExportOrderDetails from '@hooks/useExportOrderDetails';
import { usePrepareOrderDetailPageData } from '@hooks/usePrepareOrderManagementData';
import { AdminAttributesThunks } from '@pages/admin/Attributes.slice';
import { ReviewContent } from '@pages/admin/order/create/components/ReviewOrder/ReviewOrder';
import { Listing } from '@src/utils/data';
import { formatTimestamp } from '@src/utils/dates';
import { EOrderStates, EOrderType } from '@src/utils/enums';
import type { TListing, TObject, TTransaction, TUser } from '@src/utils/types';

import OrderHeaderInfor from '../../components/OrderHeaderInfor/OrderHeaderInfor';
import OrderHeaderState from '../../components/OrderHeaderState/OrderHeaderState';
import { OrderDetailThunks } from '../../OrderDetail.slice';

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
  transactionDataMap: {
    [date: string]: TTransaction;
  };
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
    transactionDataMap,
    onSaveOrderNote,
  } = props;

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { timestamp } = router.query;
  const [currentViewDate, setCurrentViewDate] = useState<number>(
    Number(timestamp),
  );
  const [viewMode, setViewMode] = useState<EPageViewMode>(EPageViewMode.edit);

  const orderId = Listing(order).getId();

  const { handler: onDownloadReviewOrderResults } = useExportOrderDetails();

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

  const { orderTitle, priceQuotationData, editViewData, reviewViewData } =
    // eslint-disable-next-line react-hooks/rules-of-hooks
    usePrepareOrderDetailPageData();

  const handleDownloadPriceQuotation = useDownloadPriceQuotation(
    orderTitle,
    priceQuotationData,
  );

  const tabItems = useMemo(
    () => {
      const foodOrderGroupedByDate = groupFoodOrderByDate({
        orderDetail,
        isGroupOrder: orderType === EOrderType.group,
      });

      return Object.keys(orderDetail).map((key: string) => {
        const foodOrder = foodOrderGroupedByDate.find(
          ({ date }) => date === key,
        );

        const updatePlanDetail = (updateData: TObject, skipRefetch = false) => {
          if (planId) {
            dispatch(
              OrderDetailThunks.updatePlanDetail({
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

  const handleConfirmOrder = () => {
    setViewMode(EPageViewMode.review);
  };

  const handleGoBackFromReviewMode = () => {
    setViewMode(EPageViewMode.edit);
  };

  const handleUpdateOrderState = (state: EOrderStates) => () => {
    updateOrderState(state);
  };

  useEffect(() => {
    dispatch(AdminAttributesThunks.fetchAttributes());
  }, []);

  const defaultActiveKey = tabItems.findIndex(({ id }) => id === timestamp);

  return (
    <div className={css.container}>
      <RenderWhen condition={viewMode === EPageViewMode.edit}>
        <OrderHeaderState
          order={order}
          handleUpdateOrderState={handleUpdateOrderState}
          updateOrderStateInProgress={updateOrderStateInProgress}
          onConfirmOrder={handleConfirmOrder}
        />
        <RenderWhen condition={showStateSectionCondition}>
          <ReviewOrderStatesSection
            data={{ transactionDataMap, isCanceledOrder: false }}
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
          <RenderWhen condition={isPickingState}>
            <RenderWhen condition={isGroupOrder}>
              <div className={css.editViewRoot}>
                <div className={css.leftPart}>
                  <ManageOrdersSection
                    setCurrentViewDate={(date) => setCurrentViewDate(date)}
                    currentViewDate={currentViewDate}
                    isDraftEditing={false}
                    ableToUpdateOrder
                  />
                </div>
                <div className={css.rightPart}>
                  <OrderDeadlineCountdownSection
                    className={css.container}
                    data={editViewData.countdownSectionData}
                    ableToUpdateOrder
                  />
                  <OrderLinkSection
                    className={css.container}
                    data={editViewData.linkSectionData}
                    isAminLayout
                    ableToUpdateOrder
                  />
                  <ManageParticipantsSection
                    className={css.container}
                    data={editViewData.manageParticipantData}
                    ableToUpdateOrder
                  />
                </div>
              </div>

              <RenderWhen.False>
                <div className={css.lineItemsTable}>
                  <ManageLineItemsSection
                    data={editViewData.manageOrdersData}
                  />
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
