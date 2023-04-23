import { useMemo } from 'react';

import ReviewOrderStatesSection from '@components/OrderDetails/ReviewView/ReviewOrderStatesSection/ReviewOrderStatesSection';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import Tabs from '@components/Tabs/Tabs';
import { ReviewContent } from '@pages/admin/order/create/components/ReviewOrder/ReviewOrder';
import { Listing } from '@src/utils/data';
import { formatTimestamp } from '@src/utils/dates';
import { EOrderStates } from '@src/utils/enums';
import type { TListing, TTransaction, TUser } from '@src/utils/types';

import OrderHeaderInfor from '../../components/OrderHeaderInfor/OrderHeaderInfor';
import OrderHeaderState from '../../components/OrderHeaderState/OrderHeaderState';

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

  const { notes, orderStateHistory } = Listing(order).getMetadata();
  const showStateSectionCondition =
    orderStateHistory.findIndex(({ state }: { state: EOrderStates }) => {
      return state === EOrderStates.inProgress;
    }) > 0;

  const tabItems = useMemo(
    () =>
      Object.keys(orderDetail).map((key: any) => {
        return {
          key,
          label: formatTimestamp(Number(key)),
          childrenFn: (childProps: any) => <ReviewContent {...childProps} />,
          childrenProps: { ...orderDetail[key], notes },
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(order), JSON.stringify(orderDetail)],
  );

  const handleUpdateOrderState = () => {
    updateOrderState(EOrderStates.picking);
  };

  const handleCancelOrder = () => {
    updateOrderState(EOrderStates.canceled);
  };

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
