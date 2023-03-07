import React from 'react';
import classNames from 'classnames';

import { InlineTextButton } from '@components/Button/Button';
import NamedLink from '@components/NamedLink/NamedLink';
import type { TDefaultProps } from '@utils/types';

import css from './FormTabNav.module.scss';

type TFormTabProps = {
  className?: string;
  id?: string;
  disabled?: boolean;
  text?: string;
  selected?: boolean;
  linkProps?: any;
  isLight?: boolean;
  order: number;
  isLast: boolean;
  onClick?: () => void;
};

const FormTab: React.FC<TFormTabProps> = (props) => {
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
    onClick,
  } = props;

  const linkClasses = classNames(css.link, {
    [css.selectedLink]: selected,
    [css.disabled]: disabled,
    [css.lightTab]: isLight,
  });

  const tabContent = linkProps ? (
    <NamedLink className={linkClasses} {...linkProps}>
      <div className={css.order}>{order}</div>
      <span className={css.linkText}>{text}</span>
    </NamedLink>
  ) : (
    <InlineTextButton
      className={linkClasses}
      type="button"
      onClick={onClick}
      disabled={disabled}>
      <div className={css.order}>{order}</div>
      <span className={css.linkText}>{text}</span>
    </InlineTextButton>
  );

  return (
    <>
      <div id={id} className={className}>
        {tabContent}
      </div>
      {!isLast && <div className={css.line}></div>}
    </>
  );
};

type TTabNavProps = TDefaultProps & {
  tabRootClassName?: string;
  tabs?: any[];
};

const FormTabNav: React.FC<TTabNavProps> = (props) => {
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
