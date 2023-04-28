import React from 'react';
import { useIntl } from 'react-intl';

import Badge, { EBadgeType } from '@components/Badge/Badge';
import { Transaction } from '@src/utils/data';
import { ETransition, txIsInitiated } from '@src/utils/transaction';
import type { TTransaction } from '@src/utils/types';

import { EVENT_STATUS } from '../../helpers/constant';
import type { TEventStatus } from '../../helpers/types';

import css from './OrderEventCard.module.scss';

type TOrderEventCardStatusProps = {
  status: TEventStatus;
  className?: string;
  subOrderTx?: TTransaction;
};

const StatusToBadgeTypeMap = {
  [EVENT_STATUS.EMPTY_STATUS]: EBadgeType.warning,
  [EVENT_STATUS.JOINED_STATUS]: EBadgeType.info,
  [EVENT_STATUS.NOT_JOINED_STATUS]: EBadgeType.default,
  [EVENT_STATUS.EXPIRED_STATUS]: EBadgeType.default,

  [ETransition.START_DELIVERY]: EBadgeType.info,
  [ETransition.COMPLETE_DELIVERY]: EBadgeType.success,
  [ETransition.EXPIRED_START_DELIVERY]: EBadgeType.default,
  [ETransition.CANCEL_DELIVERY]: EBadgeType.danger,
};

const txStateToLabelMapper = (lastTransition: string) => {
  switch (lastTransition) {
    case ETransition.START_DELIVERY:
      return 'StateItemToolTip.stateDelivering';
    case ETransition.COMPLETE_DELIVERY:
      return 'StateItemToolTip.stateDelivered';
    case ETransition.EXPIRED_START_DELIVERY:
      return 'StateItemToolTip.expire';
    case ETransition.CANCEL_DELIVERY:
      return 'StateItemToolTip.stateCanceled';

    default:
      return 'StateItemToolTip.stateDelivering';
  }
};
const OrderEventCardStatus: React.FC<TOrderEventCardStatusProps> = ({
  status,
  subOrderTx,
}) => {
  const intl = useIntl();
  const isSubOrderTxInitial = txIsInitiated(subOrderTx!);
  const subOrderTxGetter = Transaction(subOrderTx!);
  const { lastTransition } = subOrderTxGetter.getAttributes();

  return (
    <>
      {subOrderTx && !isSubOrderTxInitial ? (
        <Badge
          className={css.badge}
          type={lastTransition}
          label={intl.formatMessage({
            id: txStateToLabelMapper(lastTransition!),
          })}
        />
      ) : (
        <Badge
          className={css.badge}
          type={StatusToBadgeTypeMap[status]}
          label={intl.formatMessage({
            id: `DayColumn.Status.${status || 'empty'}`,
          })}
        />
      )}
    </>
  );
};

export default OrderEventCardStatus;
