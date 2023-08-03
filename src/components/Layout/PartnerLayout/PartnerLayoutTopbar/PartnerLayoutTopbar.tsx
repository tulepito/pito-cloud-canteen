/**
 * This is a wrapper component for different Layouts.
 * Topbar should be added to this wrapper.
 */
import type { PropsWithChildren } from 'react';
import React from 'react';
import classNames from 'classnames';

import type { TDefaultProps } from '@utils/types';

import css from './PartnerLayoutTopbar.module.scss';

type TPartnerLayoutTopbarProps = PropsWithChildren<TDefaultProps & {}>;

const PartnerLayoutTopbar: React.FC<TPartnerLayoutTopbarProps> = (props) => {
  const { className, rootClassName, children } = props;
  const classes = classNames(rootClassName || css.root, className);

  return <div className={classes}>{children}</div>;
};

export default PartnerLayoutTopbar;
