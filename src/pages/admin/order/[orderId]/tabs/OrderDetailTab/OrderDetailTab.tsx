import { useEffect, useMemo, useState } from 'react';
import isEmpty from 'lodash/isEmpty';

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
import { usePrepareOrderDetailPageData } from '@hooks/usePrepareOrderManagementData';
import { AdminAttributesThunks } from '@pages/admin/Attributes.slice';
import { ReviewContent } from '@pages/admin/order/create/components/ReviewOrder/ReviewOrder';
import { Listing } from '@src/utils/data';
import { formatTimestamp } from '@src/utils/dates';
import { EOrderStates } from '@src/utils/enums';
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
  } = props;

  const [viewMode, setViewMode] = useState<EPageViewMode>(EPageViewMode.edit);

  const dispatch = useAppDispatch();
  const orderId = Listing(order).getId();
  const {
    notes,
    orderStateHistory = [],
    plans = [],
    orderState,
    orderType = 'group',
  } = Listing(order).getMetadata();
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
      const foodOrderGroupedByDate = groupFoodOrderByDate({ orderDetail });

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
          key,
          label: formatTimestamp(Number(key)),
          childrenFn: (childProps: any) => <ReviewContent {...childProps} />,
          childrenProps: {
            ...orderDetail[key],
            notes,
            updatePlanDetail,
            timeStamp: key,
            foodOrder,
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

  useEffect(() => {
    if (!isEmpty(orderState)) {
      setViewMode(isPickingState ? EPageViewMode.edit : EPageViewMode.review);
    }
  }, [orderState]);

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
            <RenderWhen condition={orderType === 'group'}>
              <div className={css.editViewRoot}>
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
                    isAminLayout
                  />
                  <ManageParticipantsSection
                    className={css.container}
                    data={editViewData.manageParticipantData}
                  />
                </div>
              </div>
            </RenderWhen>

            <RenderWhen.False>
              <Tabs items={tabItems as any} />
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
            showStartPickingOrderButton
          />
        </RenderWhen.False>
      </RenderWhen>
    </div>
  );
};

export default OrderDetailTab;
