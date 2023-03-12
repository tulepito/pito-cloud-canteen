/**
 * MenuContent is a immediate child of Menu component sibling to MenuLabel.
 * Clicking MenuLabel toggles visibility of MenuContent.
 */
import type { CSSProperties, PropsWithChildren } from 'react';
import React, { Children } from 'react';
import classNames from 'classnames';

import ProfileMenuItem from '@components/ProfileMenuItem/ProfileMenuItem';
import type { TDefaultProps } from '@utils/types';

import css from './ProfileMenuContent.module.scss';

type TProfileMenuContentProps = PropsWithChildren<
  TDefaultProps & {
    contentClassName?: string;
    arrowPosition?: number;
    contentRef?: (e: HTMLElement | null) => HTMLElement;
    isOpen?: boolean;
    style?: CSSProperties;
  }
>;

const ProfileMenuContent: React.FC<TProfileMenuContentProps> = (props) => {
  const {
    arrowPosition = null,
    children,
    className = null,
    contentClassName = null,
    contentRef,
    isOpen = false,
    rootClassName = null,
    style = null,
  } = props;
  const rootClass = rootClassName || css.root;
  const openClasses = isOpen ? css.isOpen : css.isClosed;
  const classes = classNames(rootClass, className, openClasses);
  const contentClasses = classNames(contentClassName || css.content);

  const arrowPositionStyle =
    arrowPosition && style && style.right != null
      ? ({
          position: 'absolute',
          right: arrowPosition,
          top: 0,
        } as CSSProperties)
      : ({
          position: 'absolute',
          left: arrowPosition,
          top: 0,
        } as CSSProperties);

  const arrow = arrowPosition ? (
    <div style={arrowPositionStyle}>
      <div className={css.arrowBelow} />
      <div className={css.arrowTop} />
    </div>
  ) : null;

  Children.forEach(children, (child: any) => {
    if (child && child.type !== ProfileMenuItem) {
      throw new Error(
        'All children of ProfileMenuItem must be ProfileMenuItems.',
      );
    }
    if (child && child.key === ProfileMenuContent) {
      throw new Error(
        'All children of ProfileMenuContent must have a "key" prop.',
      );
    }
  });

  return (
    <div className={classes} ref={contentRef} style={style || {}}>
      {arrow}
      <ul className={contentClasses}>{children}</ul>
    </div>
  );
};

export default ProfileMenuContent;
