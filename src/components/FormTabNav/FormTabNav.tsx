import NamedLink from '@components/NamedLink/NamedLink';
import classNames from 'classnames';
import React from 'react';

import css from './FormTabNav.module.scss';

type TFormTab = {
  className?: string;
  id?: string;
  disabled?: boolean;
  text?: string;
  selected?: boolean;
  linkProps: any;
  isLight?: boolean;
  order: number;
  isLast: boolean;
};

const FormTab: React.FC<TFormTab> = (props) => {
  const {
    isLast,
    order,
    className,
    id,
    disabled,
    text,
    selected,
    linkProps,
    isLight,
  } = props;
  const linkClasses = classNames(css.link, {
    [css.selectedLink]: selected,
    [css.disabled]: disabled,
    [css.lightTab]: isLight,
  });

  return (
    <>
      <div id={id} className={className}>
        <NamedLink className={linkClasses} {...linkProps}>
          <div className={css.order}>{order}</div>
          <span className={css.linkText}>{text}</span>
        </NamedLink>
      </div>
      {!isLast && <div className={css.line}></div>}
    </>
  );
};

type TTabNav = {
  className?: string;
  rootClassName?: string;
  tabRootClassName?: string;
  tabs?: any[];
};

const FormTabNav: React.FC<TTabNav> = (props) => {
  const { className, rootClassName, tabRootClassName, tabs = [] } = props;
  const classes = classNames(rootClassName || css.root, className);
  const tabClasses = tabRootClassName || css.tab;
  return (
    <nav className={classes}>
      {tabs.map((tab, index) => {
        const id = typeof tab.id === 'string' ? tab.id : `${index}`;
        return (
          <FormTab
            order={index + 1}
            key={id}
            id={id}
            className={tabClasses}
            isLast={index + 1 === tabs.length}
            {...tab}
          />
        );
      })}
    </nav>
  );
};

export default FormTabNav;
