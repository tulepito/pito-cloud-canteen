import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import Button from '@components/Button/Button';
import IconLightOutline from '@components/Icons/IconLightOutline/IconLightOutline';
import AlertModal from '@components/Modal/AlertModal';
import OutsideClickHandler from '@components/OutsideClickHandler/OutsideClickHandler';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { isEnableToStartOrder, orderFlow } from '@helpers/orderHelper';
import { useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { Listing } from '@src/utils/data';
import {
  EOrderDraftStates,
  EOrderStates,
  EOrderType,
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
  isDraftEditing?: boolean;
  confirmUpdateDisabled?: boolean;
  turnOnDraftEditMode?: () => void;
};

const OrderHeaderState: React.FC<OrderHeaderStateProps> = (props) => {
  const {
    order,
    handleUpdateOrderState,
    updateOrderStateInProgress,
    onConfirmOrder,
    turnOnDraftEditMode,
    isDraftEditing = false,
    confirmUpdateDisabled = true,
  } = props;

  const intl = useIntl();
  const orderStateActionDropdownControl = useBoolean();
  const planData = useAppSelector((state) => state.OrderManagement.planData);
  const confirmCancelOrderActions = useBoolean();

  const planDataGetter = Listing(planData as TListing);
  const { orderDetail = {} } = planDataGetter.getMetadata();
  const orderListing = Listing(order);
  const { title } = orderListing.getAttributes();
  const { orderState, orderType = EOrderType.group } =
    orderListing.getMetadata();
  const orderStateLabel = useMemo(
    () => getLabelByKey(ORDER_STATES_OPTIONS, orderState),
    [orderState],
  );
  const statusClasses = classNames(css.status, {
    [css.statusPicking]: orderState === EOrderStates.picking,
  });
  const canStartOrder = isEnableToStartOrder(
    orderDetail,
    orderType === EOrderType.group,
  );
  const disableConfirmButton = !canStartOrder || updateOrderStateInProgress;

  const shouldShowUpdateOrderStateBtn =
    orderState === EOrderDraftStates.pendingApproval ||
    orderState === EOrderDraftStates.draft;

  const shouldShowStartOrderBtn =
    typeof onConfirmOrder !== 'undefined' &&
    orderState === EOrderStates.picking;

  const shouldManagePickingBtn = orderState === EOrderStates.inProgress;
  const canCancelOrder = orderFlow?.[
    orderState as TTransitionOrderState
  ]?.includes(EOrderStates.canceled);

  const hasAnyActionsCanDo =
    canCancelOrder || shouldShowUpdateOrderStateBtn || shouldManagePickingBtn;

  const handleAgreeCancelOrder = () => {
    if (canCancelOrder) {
      handleUpdateOrderState?.(EOrderStates.canceled)();
    }
    confirmCancelOrderActions.setFalse();
  };
  const handleDisagreeCancelOrder = () => {
    confirmCancelOrderActions.setFalse();
  };

  const handleCloseDropdownAfterClickedAction = (func: () => void) => () => {
    func();
    orderStateActionDropdownControl.setFalse();
  };

  const handleClickCancelOrder = handleCloseDropdownAfterClickedAction(
    confirmCancelOrderActions.setTrue,
  );
  const handleClickTurnOnDraftEditMode = handleCloseDropdownAfterClickedAction(
    turnOnDraftEditMode!,
  );

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
                <div
                  className={css.actionItem}
                  onClick={handleClickCancelOrder}>
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
                <div
                  className={css.actionItem}
                  onClick={handleClickTurnOnDraftEditMode}>
                  Quản lý chọn món
                </div>
              </RenderWhen>
            </OutsideClickHandler>
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
          inProgress={updateOrderStateInProgress}
          disabled={disableConfirmButton}>
          Xác nhận
        </Button>
      </RenderWhen>
      <RenderWhen condition={isDraftEditing}>
        <Button
          variant="cta"
          className={css.stateBtn}
          disabled={confirmUpdateDisabled}
          onClick={onConfirmOrder}>
          Cập nhật
        </Button>
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
        confirmInProgress={updateOrderStateInProgress}
        cancelDisabled={updateOrderStateInProgress}
      />
    </div>
  );
};

export default OrderHeaderState;
