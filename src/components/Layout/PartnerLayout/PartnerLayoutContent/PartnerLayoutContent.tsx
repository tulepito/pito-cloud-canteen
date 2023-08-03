/**
 * This is a wrapper component for different Layouts. Main content should be added to this wrapper.
 */
import type { PropsWithChildren } from 'react';
import React from 'react';
import classNames from 'classnames';

import type { TDefaultProps } from '@utils/types';

import { PartnerBreadCrumbs } from '../PartnerBreadCrumbs/PartnerBreadCrumbs';

import css from './PartnerLayoutContent.module.scss';

type TPartnerLayoutContentProps = PropsWithChildren<
  TDefaultProps & {
    isMenuOpen?: boolean;
  }
>;

const PartnerLayoutContent: React.FC<TPartnerLayoutContentProps> = (props) => {
  const { className, rootClassName, children, isMenuOpen } = props;
  const classes = classNames(rootClassName || css.root, className, {
    [css.menuOpen]: isMenuOpen,
  });

  return (
    <div className={classes} role="main">
      <PartnerBreadCrumbs />
      <div className={css.container}>{children}</div>
    </div>
  );
};

export default PartnerLayoutContent;
