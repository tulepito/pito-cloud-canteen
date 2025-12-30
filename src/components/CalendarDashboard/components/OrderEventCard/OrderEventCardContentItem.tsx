import type { PropsWithChildren, ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';

import css from './OrderEventCard.module.scss';

type TEventCardContentItemProps = PropsWithChildren<{
  icon?: ReactNode;
  isHighlight?: boolean;
  noEllipsis?: boolean;
}>;

const OrderEventCardContentItem: React.FC<TEventCardContentItemProps> = ({
  icon,
  children,
  isHighlight = false,
  noEllipsis = false,
}) => {
  const iconElement = React.cloneElement(icon as ReactElement, {
    className: classNames(css.icon, {
      [css.highLightIcon]: isHighlight,
    }),
  });

  return (
    <div className={css.eventContentItem}>
      <div className={css.eventContentItemIcon}>{iconElement}</div>
      <span
        className={classNames(
          noEllipsis ? css.eventContentItemTextFull : css.eventContentItemText,
          {
            [css.highlightText]: isHighlight,
          },
        )}>
        {children}
      </span>
    </div>
  );
};

export default OrderEventCardContentItem;
