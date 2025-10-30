import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';

import Button from '@components/Button/Button';
import IconCancel from '@components/Icons/IconCancel/IconCancel';
import IconDelivering from '@components/Icons/IconDelivering/IconDelivering';
import IconTickWithBackground from '@components/Icons/IconTickWithBackground/IconTickWithBackground';
import IconWarning from '@components/Icons/IconWarning/IconWarning';
import AlertModal from '@components/Modal/AlertModal';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { AdminManageOrderThunks } from '@pages/admin/order/AdminManageOrder.slice';
import { Transaction } from '@src/utils/data';
import {
  CHANGE_STRUCTURE_TX_PROCESS_VERSION,
  ETransition,
  TRANSITIONS_TO_STATE_CANCELED,
} from '@src/utils/transaction';
import type { TTransaction } from '@src/utils/types';

import css from './StateItemTooltip.module.scss';

type TStateItemTooltipProps = {
  lastTransition: string;
  transactionId: string;
  transaction: TTransaction;
};

const StateItemTooltip: React.FC<TStateItemTooltipProps> = ({
  lastTransition,
  transactionId,
  transaction,
}) => {
  const dispatch = useAppDispatch();
  const transitInProgress = useAppSelector(
    (state) => state.AdminManageOrder.transitInProgress,
  );
  const partnerConfirmController = useBoolean();
  const partnerRejectController = useBoolean();
  const deliveringController = useBoolean();
  const deliveredController = useBoolean();
  // const failedController = useBoolean();
  const confirmCancelController = useBoolean();
  const canceledController = useBoolean();

  const { processVersion = CHANGE_STRUCTURE_TX_PROCESS_VERSION - 1 } =
    Transaction(transaction).getAttributes();

  console.log('transactionId', transactionId);
  console.log('transaction', transaction);
  console.log('processVersion', processVersion);
  console.log(
    'CHANGE_STRUCTURE_TX_PROCESS_VERSION',
    CHANGE_STRUCTURE_TX_PROCESS_VERSION,
  );
  const isNewStructureTxVersion =
    processVersion >= CHANGE_STRUCTURE_TX_PROCESS_VERSION;
  const shouldShowPartnerActions = isNewStructureTxVersion;
  const cancelTransition =
    lastTransition === ETransition.PARTNER_REJECT_SUB_ORDER
      ? ETransition.OPERATOR_CANCEL_AFTER_PARTNER_REJECTED
      : lastTransition === ETransition.PARTNER_CONFIRM_SUB_ORDER
        ? ETransition.OPERATOR_CANCEL_AFTER_PARTNER_CONFIRMED
        : ETransition.OPERATOR_CANCEL_PLAN;

  const transitTx = (transition: ETransition) => async () => {
    await dispatch(
      AdminManageOrderThunks.transit({
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
    transitTx(cancelTransition)();
  };

  useEffect(() => {
    if (transitInProgress) {
      return;
    }
    console.log('lastTransition', lastTransition);
    if (lastTransition === ETransition.INITIATE_TRANSACTION) {
      canceledController.setTrue();

      if (isNewStructureTxVersion) {
        console.log('isNewStructureTxVersion', isNewStructureTxVersion);
        partnerConfirmController.setTrue();
        partnerRejectController.setTrue();
      } else {
        deliveringController.setTrue();
      }
    } else if (lastTransition === ETransition.PARTNER_CONFIRM_SUB_ORDER) {
      partnerConfirmController.setFalse();
      partnerRejectController.setFalse();
      deliveringController.setTrue();
      canceledController.setTrue();
    } else if (lastTransition === ETransition.PARTNER_REJECT_SUB_ORDER) {
      partnerConfirmController.setFalse();
      partnerRejectController.setFalse();
      deliveringController.setFalse();
      canceledController.setTrue();
    } else if (lastTransition === ETransition.START_DELIVERY) {
      deliveringController.setFalse();
      deliveredController.setTrue();
      canceledController.setFalse();

      if (isNewStructureTxVersion) {
        partnerConfirmController.setFalse();
      }
    } else if (lastTransition === ETransition.COMPLETE_DELIVERY) {
      deliveredController.setFalse();
      deliveringController.setFalse();
    } else if (
      TRANSITIONS_TO_STATE_CANCELED.includes(lastTransition as ETransition)
    ) {
      deliveringController.setFalse();
      deliveredController.setFalse();
      canceledController.setFalse();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transitInProgress, lastTransition]);

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
        confirmInProgress={transitInProgress}
        handleClose={handleCancelCancelingProcess}
        onCancel={handleCancelCancelingProcess}
        onConfirm={handleConfirmCancel}>
        Bạn có chắc chắn muốn huỷ đơn không?
      </AlertModal>

      <RenderWhen condition={shouldShowPartnerActions}>
        <Button
          variant="inline"
          className={css.row}
          disabled={!partnerConfirmController.value}
          onClick={transitTx(ETransition.PARTNER_CONFIRM_SUB_ORDER)}>
          <IconTickWithBackground
            className={classNames(css.icon, css.confirmIcon)}
          />
          <div className={css.stateText}>
            <FormattedMessage id="StateItemToolTip.statePartnerConfirmed" />
          </div>
        </Button>
        <Button
          variant="inline"
          className={css.row}
          disabled={!partnerRejectController.value}
          onClick={transitTx(ETransition.PARTNER_REJECT_SUB_ORDER)}>
          <IconWarning className={classNames(css.icon, css.rejectIcon)} />
          <div className={css.stateText}>
            <FormattedMessage id="StateItemToolTip.statePartnerRejected" />
          </div>
        </Button>
      </RenderWhen>
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
