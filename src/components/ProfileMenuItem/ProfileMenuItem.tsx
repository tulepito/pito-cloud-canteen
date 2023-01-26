/**
 * MenuItem is part of Menu and specifically a child of MenuContent.
 * MenuItems should have a 'key' prop specified.
 * https://facebook.github.io/react/docs/lists-and-keys.html#keys
 *
 * Example:
 *   <MenuItem key="item 1"><a href="example.com">Click me</a><MenuItem>
 */
import type { TDefaultProps } from '@utils/types';
import classNames from 'classnames';
import type { PropsWithChildren } from 'react';
import React from 'react';

import css from './ProfileMenuItem.module.scss';

type TMenuItemProps = PropsWithChildren<TDefaultProps & {}>;

const ProfileMenuItem: React.FC<TMenuItemProps> = (props) => {
  const { children, className, rootClassName } = props;
  const rootClass = rootClassName || css.root;
  const classes = classNames(rootClass, className);

  return (
    <li className={classes} role="menuitem">
      {children}
    </li>
  );
};

export default ProfileMenuItem;
