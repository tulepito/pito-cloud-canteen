import classNames from 'classnames';

import IconCancel from '@components/Icons/IconCancel/IconCancel';
import IconDelivering from '@components/Icons/IconDelivering/IconDelivering';
import IconFail from '@components/Icons/IconFail/IconFail';
import IconTickWithBackground from '@components/Icons/IconTickWithBackground/IconTickWithBackground';
import {
  txIsCanceled,
  txIsCompleted,
  txIsDelivering,
  txIsDeliveryFailed,
  txIsInitiated,
} from '@utils/transaction';

import type { TTimeLineItemProps } from './types';

import css from './StateItem.module.scss';

type TStateItemProps = TTimeLineItemProps;

const StateItem: React.FC<TStateItemProps> = ({
  data: { date, tx },
  rootClassName,
  className,
}) => {
  const rootClasses = classNames(rootClassName || css.root, className);

  let stateComponent = <div className={classNames(css.icon, css.iconEmpty)} />;

  if (txIsInitiated(tx)) {
    //
  } else if (txIsCompleted(tx)) {
    stateComponent = <IconTickWithBackground className={css.icon} />;
  } else if (txIsDelivering(tx)) {
    stateComponent = <IconDelivering className={css.icon} />;
  } else if (txIsDeliveryFailed(tx)) {
    stateComponent = <IconFail className={css.icon} />;
  } else if (txIsCanceled(tx)) {
    stateComponent = <IconCancel className={css.icon} />;
  }

  return (
    <div className={rootClasses}>
      <div className={css.stateContainer}>{stateComponent}</div>
      <div className={css.date}>{date}</div>
    </div>
  );
};

export default StateItem;
