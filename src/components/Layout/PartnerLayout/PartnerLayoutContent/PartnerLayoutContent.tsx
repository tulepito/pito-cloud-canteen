/**
 * This is a wrapper component for different Layouts. Main content should be added to this wrapper.
 */
import type { PropsWithChildren } from 'react';
import React from 'react';
import classNames from 'classnames';

import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useViewport } from '@hooks/useViewport';
import type { TDefaultProps } from '@utils/types';

import { PartnerBreadCrumbs } from '../PartnerBreadCrumbs/PartnerBreadCrumbs';

import css from './PartnerLayoutContent.module.scss';

type TPartnerLayoutContentProps = PropsWithChildren<
  TDefaultProps & {
    isMenuOpen?: boolean;
    hideHeader?: boolean;
  }
>;

const PartnerLayoutContent: React.FC<TPartnerLayoutContentProps> = (props) => {
  const {
    className,
    rootClassName,
    children,
    isMenuOpen,
    hideHeader = false,
  } = props;
  const { isMobileLayout } = useViewport();

  const classes = classNames(
    rootClassName || css.root,
    {
      [css.hideHeader]: hideHeader,
      [css.menuOpen]: isMenuOpen,
    },
    className,
  );

  return (
    <div className={classes} role="main">
      <RenderWhen condition={!isMobileLayout}>
        <PartnerBreadCrumbs />
      </RenderWhen>
      <div className={css.container}>{children}</div>
    </div>
  );
};

export default PartnerLayoutContent;
