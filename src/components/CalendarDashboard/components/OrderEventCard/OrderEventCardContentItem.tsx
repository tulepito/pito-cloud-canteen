import type { PropsWithChildren, ReactNode } from 'react';

import css from './OrderEventCard.module.scss';

type TEventCardContentItemProps = PropsWithChildren<{
  icon?: ReactNode;
}>;

const OrderEventCardContentItem: React.FC<TEventCardContentItemProps> = ({
  icon,
  children,
}) => {
  return (
    <div className={css.eventContentItem}>
      <div className={css.eventContentItemIcon}>{icon}</div>
      <span className={css.eventContentItemText}>{children}</span>
    </div>
  );
};

export default OrderEventCardContentItem;
