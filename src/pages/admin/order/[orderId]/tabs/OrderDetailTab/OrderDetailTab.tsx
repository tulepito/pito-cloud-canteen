import { useMemo } from 'react';

import Tabs from '@components/Tabs/Tabs';
import { ReviewContent } from '@pages/admin/order/create/components/ReviewOrder/ReviewOrder';
import { formatTimestamp } from '@src/utils/dates';
import { EOrderStates } from '@src/utils/enums';
import type { TListing, TUser } from '@src/utils/types';

import OrderHeaderInfor from '../../components/OrderHeaderInfor/OrderHeaderInfor';
import OrderHeaderState from '../../components/OrderHeaderState/OrderHeaderState';

import css from './OrderDetailTab.module.scss';

type OrderDetailTabProps = {
  order: TListing;
  orderDetail: any;
  company: TUser;
  booker: TUser;
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
  } = props;
  const tabItems = useMemo(
    () =>
      Object.keys(orderDetail).map((key: any) => {
        return {
          key,
          label: formatTimestamp(Number(key)),
          childrenFn: (childProps: any) => <ReviewContent {...childProps} />,
          childrenProps: { ...orderDetail[key] },
        };
      }),
    [orderDetail],
  );

  const handleUpdateOrderState = () => {
    updateOrderState(EOrderStates.picking);
  };

  return (
    <div className={css.container}>
      <OrderHeaderState
        order={order}
        handleUpdateOrderState={handleUpdateOrderState}
        updateOrderStateInProgress={updateOrderStateInProgress}
      />
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
