import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import Button from '@components/Button/Button';
import IconCancel from '@components/Icons/IconCancel/IconCancel';
import IconDelivering from '@components/Icons/IconDelivering/IconDelivering';
import IconTickWithBackground from '@components/Icons/IconTickWithBackground/IconTickWithBackground';
import AlertModal from '@components/Modal/AlertModal';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { OrderDetailThunks } from '@pages/admin/order/[orderId]/OrderDetail.slice';
import { Transaction } from '@src/utils/data';
import {
  ETransition,
  txIsCanceled,
  txIsCompleted,
  txIsDelivering,
  txIsInitiated,
} from '@src/utils/transaction';
import type { TTransaction } from '@src/utils/types';

import css from './StateItemTooltip.module.scss';

type TStateItemTooltipProps = {
  tx: TTransaction;
};

const StateItemTooltip: React.FC<TStateItemTooltipProps> = ({ tx }) => {
  const dispatch = useAppDispatch();
  const transitInProgress = useAppSelector(
    (state) => state.OrderDetail.transitInProgress,
  );
  const deliveringController = useBoolean();
  const deliveredController = useBoolean();
  // const failedController = useBoolean();
  const confirmCancelController = useBoolean();
  const canceledController = useBoolean();

  const transactionId = Transaction(tx).getId();

  const transitTx = (transition: ETransition) => async () => {
    await dispatch(
      OrderDetailThunks.transit({
        transactionId,
        transition,
      }),
    );
  };

  const handleCancelPlan = () => {
    confirmCancelController.setTrue();
  };

  const handleCancelCancelingProcess = () => {
    confirmCancelController.setFalse();
  };

  const handleConfirmCancel = () => {
    confirmCancelController.setFalse();
    transitTx(ETransition.OPERATOR_CANCEL_PLAN)();
  };

  useEffect(() => {
    if (transitInProgress) {
      return;
    }

    if (txIsInitiated(tx)) {
      canceledController.setTrue();
      deliveringController.setTrue();
    } else if (txIsDelivering(tx)) {
      deliveredController.setTrue();
    } else if (txIsCompleted(tx)) {
      deliveredController.setFalse();
      deliveringController.setFalse();
    } else if (txIsCanceled(tx)) {
      deliveringController.setFalse();
      deliveredController.setFalse();
      canceledController.setFalse();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transitInProgress, JSON.stringify(tx)]);

  return (
    <div className={css.root}>
      <div className={css.row}>
        <div className={css.defaultIcon} />
        <div className={css.stateText}>
          <FormattedMessage id="StateItemToolTip.stateInitiated" />
        </div>
      </div>
      <AlertModal
        isOpen={confirmCancelController.value}
        title={<div className={css.modalTitle}>Huỷ đơn hàng</div>}
        cancelLabel={'Không huỷ'}
        confirmLabel={'Huỷ đơn hàng'}
        cancelDisabled={transitInProgress}
        confirmDisabled={transitInProgress}
        handleClose={handleCancelCancelingProcess}
        onCancel={handleCancelCancelingProcess}
        onConfirm={handleConfirmCancel}>
        Bạn có chắc chắn muốn huỷ đơn không?
      </AlertModal>
      <Button
        variant="inline"
        className={css.row}
        disabled={!deliveringController.value}
        onClick={transitTx(ETransition.START_DELIVERY)}>
        <IconDelivering className={css.icon} />
        <div className={css.stateText}>
          <FormattedMessage id="StateItemToolTip.stateDelivering" />
        </div>
      </Button>
      <Button
        variant="inline"
        className={css.row}
        disabled={!deliveredController.value}
        onClick={transitTx(ETransition.COMPLETE_DELIVERY)}>
        <IconTickWithBackground className={css.icon} />
        <div className={css.stateText}>
          <FormattedMessage id="StateItemToolTip.stateDelivered" />
        </div>
      </Button>
      {/* <Button
        variant="inline"
        className={css.row}
        disabled={!failedController.value}>
        <IconFail className={css.icon} />
        <div className={css.stateText}>
          <FormattedMessage id="StateItemToolTip.stateFailed" />
        </div>
      </Button> */}
      <Button
        variant="inline"
        className={css.row}
        disabled={!canceledController.value}
        onClick={handleCancelPlan}>
        <IconCancel className={css.icon} />
        <div className={css.stateText}>
          <FormattedMessage id="StateItemToolTip.stateCanceled" />
        </div>
      </Button>
    </div>
  );
};

export default StateItemTooltip;
