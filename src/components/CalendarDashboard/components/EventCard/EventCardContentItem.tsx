import type { PropsWithChildren, ReactNode } from 'react';

import css from './EventCard.module.scss';

type TEventCardContentItemProps = PropsWithChildren<{
  icon?: ReactNode;
}>;

const EventCardContentItem: React.FC<TEventCardContentItemProps> = ({
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

export default EventCardContentItem;
