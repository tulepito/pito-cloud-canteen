import { useMemo } from 'react';
import classNames from 'classnames';

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
  handleUpdateOrderState: (state: EOrderStates) => () => void;
  onConfirmOrder?: () => void;
  updateOrderStateInProgress: boolean;
  turnOnDraftEditMode: () => void;
};

const OrderHeaderState: React.FC<OrderHeaderStateProps> = (props) => {
  const {
    order,
    handleUpdateOrderState,
    updateOrderStateInProgress,
    onConfirmOrder,
    turnOnDraftEditMode,
  } = props;
  const orderStateActionDropdownControl = useBoolean();
  const orderListing = Listing(order);
  const { title } = orderListing.getAttributes();
  const { orderState } = orderListing.getMetadata();
  const orderStateLabel = useMemo(
    () => getLabelByKey(ORDER_STATES_OPTIONS, orderState),
    [orderState],
  );
  const statusClasses = classNames(css.status, {
    [css.statusPicking]: orderState === EOrderStates.picking,
  });

  const shouldShowUpdateOrderStateBtn =
    orderState === EOrderDraftStates.pendingApproval ||
    orderState === EOrderDraftStates.draft;

  const shouldShowStartOrderBtn = orderState === EOrderStates.picking;
  const shouldManagePickingBtn = orderState === EOrderStates.inProgress;
  const canCancelOrder = orderFlow?.[
    orderState as TTransitionOrderState
  ]?.includes(EOrderStates.canceled);

  const hasAnyActionsCanDo =
    canCancelOrder || shouldShowUpdateOrderStateBtn || shouldManagePickingBtn;

  const onCancelOrder = () => {
    if (canCancelOrder) {
      handleUpdateOrderState?.(EOrderStates.canceled)();
    }
  };

  return (
    <div className={css.header}>
      <div className={css.orderTitle}>
        <div className={css.titleLabel}>Đơn hàng </div>
        <div className={css.orderId}>{`#${title}`}</div>
        <div className={statusClasses}>{orderStateLabel}</div>
        <div className={css.action}>
          <IconLightOutline onClick={orderStateActionDropdownControl.setTrue} />
          <RenderWhen
            condition={
              orderStateActionDropdownControl.value && hasAnyActionsCanDo
            }>
            <OutsideClickHandler
              className={css.actionList}
              onOutsideClick={orderStateActionDropdownControl.setFalse}>
              <RenderWhen condition={canCancelOrder}>
                <div className={css.actionItem} onClick={onCancelOrder}>
                  Huỷ đơn
                </div>
              </RenderWhen>
              <RenderWhen condition={shouldShowUpdateOrderStateBtn}>
                <div
                  className={css.actionItem}
                  onClick={handleUpdateOrderState(EOrderStates.picking)}>
                  Hoàn tất
                </div>
              </RenderWhen>
              <RenderWhen condition={shouldManagePickingBtn}>
                <div className={css.actionItem} onClick={turnOnDraftEditMode}>
                  Quản lý chọn món
                </div>
              </RenderWhen>
            </OutsideClickHandler>{' '}
          </RenderWhen>
        </div>
      </div>
      <RenderWhen condition={shouldShowUpdateOrderStateBtn}>
        <Button
          variant="cta"
          className={css.stateBtn}
          onClick={handleUpdateOrderState(EOrderStates.picking)}
          inProgress={updateOrderStateInProgress}>
          Đặt đơn
        </Button>
      </RenderWhen>
      <RenderWhen condition={shouldShowStartOrderBtn}>
        <Button
          variant="cta"
          className={css.stateBtn}
          onClick={onConfirmOrder}
          inProgress={updateOrderStateInProgress}>
          Xác nhận
        </Button>
      </RenderWhen>
    </div>
  );
};

export default OrderHeaderState;
