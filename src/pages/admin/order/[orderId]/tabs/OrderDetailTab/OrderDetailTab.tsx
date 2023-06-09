import { useEffect, useMemo } from 'react';

import ReviewOrderStatesSection from '@components/OrderDetails/ReviewView/ReviewOrderStatesSection/ReviewOrderStatesSection';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import Tabs from '@components/Tabs/Tabs';
import { useAppDispatch } from '@hooks/reduxHooks';
import { AdminAttributesThunks } from '@pages/admin/Attributes.slice';
import { ReviewContent } from '@pages/admin/order/create/components/ReviewOrder/ReviewOrder';
import { groupFoodOrderByDate } from '@pages/company/orders/[orderId]/picking/helpers/orderDetailHelper';
import { Listing } from '@src/utils/data';
import { formatTimestamp } from '@src/utils/dates';
import { EOrderStates, EOrderType } from '@src/utils/enums';
import type { TListing, TObject, TTransaction, TUser } from '@src/utils/types';

import OrderHeaderInfor from '../../components/OrderHeaderInfor/OrderHeaderInfor';
import OrderHeaderState from '../../components/OrderHeaderState/OrderHeaderState';
import { OrderDetailThunks } from '../../OrderDetail.slice';

import css from './OrderDetailTab.module.scss';

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
  const dispatch = useAppDispatch();
  const orderId = Listing(order).getId();

  const {
    notes,
    orderStateHistory = [],
    plans = [],
    orderType = EOrderType.group,
  } = Listing(order).getMetadata();
  const planId = plans.length > 0 ? plans[0] : undefined;
  const showStateSectionCondition =
    orderStateHistory.findIndex(({ state }: { state: EOrderStates }) => {
      return state === EOrderStates.inProgress;
    }) > 0;

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

  const handleUpdateOrderState = () => {
    updateOrderState(EOrderStates.picking);
  };

  const handleCancelOrder = () => {
    updateOrderState(EOrderStates.canceled);
  };

  useEffect(() => {
    dispatch(AdminAttributesThunks.fetchAttributes());
  }, []);

  return (
    <div className={css.container}>
      <OrderHeaderState
        order={order}
        handleUpdateOrderState={handleUpdateOrderState}
        updateOrderStateInProgress={updateOrderStateInProgress}
        handleCancelOrder={handleCancelOrder}
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
        <Tabs items={tabItems as any} />
      </div>
    </div>
  );
};

export default OrderDetailTab;
