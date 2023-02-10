import IconCheckWithBackground from '@components/Icons/IconCheckWithBackground/IconCheckWithBackground';
import IconDelivering from '@components/Icons/IconDelivering/IconDelivering';
import IconPending from '@components/Icons/IconPending/IconPending';
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
    case 'pending':
      stateComponent = <IconCheckWithBackground className={css.state} />;
      break;
    case 'delivering':
      stateComponent = <IconDelivering className={css.state} />;
      break;
    case 'completed':
      stateComponent = <IconPending className={css.state} />;
      break;
    default:
      stateComponent = <div className={classNames(css.icon, css.iconEmpty)} />;
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
