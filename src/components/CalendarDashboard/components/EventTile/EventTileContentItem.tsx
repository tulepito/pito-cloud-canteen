import type { PropsWithChildren, ReactNode } from 'react';

import css from './EventTile.module.scss';

type TEventTileContentItemProps = PropsWithChildren<{
  icon?: ReactNode;
}>;

const EventTileContentItem: React.FC<TEventTileContentItemProps> = ({
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

export default EventTileContentItem;
