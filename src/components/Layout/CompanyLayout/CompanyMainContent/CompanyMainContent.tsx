/**
 * This is a wrapper component for different Layouts. Main content should be added to this wrapper.
 */
import type { TDefaultProps } from '@utils/types';
import classNames from 'classnames';
import type { PropsWithChildren } from 'react';
import React from 'react';

import css from './CompanyMainContent.module.scss';

type TCompanyMainContentProps = PropsWithChildren<
  TDefaultProps & {
    hasSideBar: boolean;
    hasHeader: boolean;
  }
>;

const CompanyMainContent: React.FC<TCompanyMainContentProps> = (props) => {
  const { className, rootClassName, children, hasSideBar, hasHeader } = props;

  const classes = classNames(
    rootClassName || css.root,
    { [css.hasSideBar]: hasSideBar, [css.hasHeader]: hasHeader },
    className,
  );

  return (
    <div className={classes} role="main">
      {children}
    </div>
  );
};

export default CompanyMainContent;
