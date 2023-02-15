import IconCancel from '@components/Icons/IconCancel/IconCancel';
import IconCheckWithBackground from '@components/Icons/IconCheckWithBackground/IconCheckWithBackground';
import IconDelivering from '@components/Icons/IconDelivering/IconDelivering';
import IconFail from '@components/Icons/IconFail/IconFail';
import { ETransactionState } from '@utils/transaction';
import classNames from 'classnames';

import css from './StateItem.module.scss';
import type { TTimeLineItemProps } from './types';

type TStateItemProps = TTimeLineItemProps;

const StateItem: React.FC<TStateItemProps> = ({
  data: { date, state },
  rootClassName,
  className,
}) => {
  const rootClasses = classNames(rootClassName || css.root, className);

  let stateComponent;

  switch (state) {
    case ETransactionState.INITIAL:
    case ETransactionState.INITIATED:
      stateComponent = <div className={classNames(css.icon, css.iconEmpty)} />;
      break;
    case ETransactionState.DELIVERING:
      stateComponent = <IconDelivering className={css.icon} />;
      break;
    case ETransactionState.FAILED_DELIVERY:
      stateComponent = <IconFail className={css.icon} />;
      break;
    case ETransactionState.CANCELED:
      stateComponent = <IconCancel className={css.icon} />;
      break;
    default:
      stateComponent = <IconCheckWithBackground className={css.icon} />;
      break;
  }

  return (
    <div className={rootClasses}>
      <div className={css.stateContainer}>{stateComponent}</div>
      <div className={css.date}>{date}</div>
    </div>
  );
};

export default StateItem;
