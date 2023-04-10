import { useMemo } from 'react';

import Button from '@components/Button/Button';
import IconLightOutline from '@components/Icons/IconLightOutline/IconLightOutline';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { Listing } from '@src/utils/data';
import {
  EOrderDraftStates,
  getLabelByKey,
  ORDER_STATES_OPTIONS,
} from '@src/utils/enums';
import type { TListing } from '@src/utils/types';

import css from './OrderHeaderState.module.scss';

type OrderHeaderStateProps = {
  order: TListing;
  handleUpdateOrderState: () => void;
  updateOrderStateInProgress: boolean;
};
const OrderHeaderState: React.FC<OrderHeaderStateProps> = (props) => {
  const { order, handleUpdateOrderState, updateOrderStateInProgress } = props;
  const orderListing = Listing(order);
  const { title } = orderListing.getAttributes();
  const { orderState } = orderListing.getMetadata();
  const orderStateLabel = useMemo(
    () => getLabelByKey(ORDER_STATES_OPTIONS, orderState),
    [orderState],
  );
  const shouldShowUpdateOrderStateBtn =
    orderState === EOrderDraftStates.pendingApproval ||
    orderState === EOrderDraftStates.draft;

  return (
    <div className={css.header}>
      <div className={css.orderTitle}>
        <div className={css.titleLabel}>Đơn hàng </div>
        <div className={css.orderId}>{`#${title}`}</div>
        <div className={css.status}>{orderStateLabel}</div>
        <div className={css.action}>
          <IconLightOutline />
        </div>
      </div>
      <RenderWhen condition={shouldShowUpdateOrderStateBtn}>
        <Button
          variant="cta"
          className={css.stateBtn}
          onClick={handleUpdateOrderState}
          inProgress={updateOrderStateInProgress}>
          Đặt đơn
        </Button>
      </RenderWhen>
    </div>
  );
};

export default OrderHeaderState;
