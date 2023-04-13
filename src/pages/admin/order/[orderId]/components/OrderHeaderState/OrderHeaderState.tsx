import { useMemo } from 'react';

import Button from '@components/Button/Button';
import IconLightOutline from '@components/Icons/IconLightOutline/IconLightOutline';
import OutsideClickHandler from '@components/OutsideClickHandler/OutsideClickHandler';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { orderFlow } from '@helpers/orderHelper';
import useBoolean from '@hooks/useBoolean';
import { Listing } from '@src/utils/data';
import {
  EOrderDraftStates,
  EOrderStates,
  getLabelByKey,
  ORDER_STATES_OPTIONS,
} from '@src/utils/enums';
import type { TListing, TTransitionOrderState } from '@src/utils/types';

import css from './OrderHeaderState.module.scss';

type OrderHeaderStateProps = {
  order: TListing;
  handleUpdateOrderState: () => void;
  updateOrderStateInProgress: boolean;
  handleCancelOrder?: () => void;
};
const OrderHeaderState: React.FC<OrderHeaderStateProps> = (props) => {
  const {
    order,
    handleUpdateOrderState,
    updateOrderStateInProgress,
    handleCancelOrder,
  } = props;
  const orderStateActionDropdownControl = useBoolean();
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

  const canCancelOrder = orderFlow?.[
    orderState as TTransitionOrderState
  ]?.includes(EOrderStates.canceled);

  const onCancelOrder = () => {
    if (canCancelOrder) {
      handleCancelOrder?.();
    }
  };

  return (
    <div className={css.header}>
      <div className={css.orderTitle}>
        <div className={css.titleLabel}>Đơn hàng </div>
        <div className={css.orderId}>{`#${title}`}</div>
        <div className={css.status}>{orderStateLabel}</div>
        <div className={css.action}>
          <IconLightOutline onClick={orderStateActionDropdownControl.setTrue} />
          {orderStateActionDropdownControl.value && canCancelOrder && (
            <OutsideClickHandler
              className={css.actionList}
              onOutsideClick={orderStateActionDropdownControl.setFalse}>
              <div className={css.actionItem} onClick={onCancelOrder}>
                Huỷ đơn
              </div>
            </OutsideClickHandler>
          )}
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
