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
};

const FormTab: React.FC<TFormTab> = (props) => {
  const { className, id, disabled, text, selected, linkProps, isLight } = props;
  const linkClasses = classNames(css.link, {
    [css.selectedLink]: selected,
    [css.disabled]: disabled,
    [css.lightTab]: isLight,
  });

  return (
    <div id={id} className={className}>
      <NamedLink className={linkClasses} {...linkProps}>
        {text}
      </NamedLink>
    </div>
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
        return <FormTab key={id} id={id} className={tabClasses} {...tab} />;
      })}
    </nav>
  );
};

export default FormTabNav;
