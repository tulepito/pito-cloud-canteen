import type { PropsWithChildren, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';

import { InlineTextButton } from '@components/Button/Button';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import useBoolean from '@hooks/useBoolean';
import type { TDefaultProps } from '@utils/types';

import css from './Collapsible.module.scss';

type TCollapsibleProps = PropsWithChildren<
  TDefaultProps & {
    openClassName?: string;
    label: ReactNode;
    labelSectionClassName?: string;
    labelClassName?: string;
    contentClassName?: string;
  }
>;

const Collapsible: React.FC<TCollapsibleProps> = (props) => {
  const {
    className,
    rootClassName,
    openClassName,
    label,
    labelClassName,
    labelSectionClassName,
    children,
    contentClassName,
  } = props;

  const { value: isOpen, toggle } = useBoolean(true);

  const classes = classNames(
    rootClassName || css.root,
    {
      [css.isOpen]: isOpen,
    },
    openClassName ? { [openClassName]: isOpen } : {},
    className,
  );
  const labelSectionClasses = classNames(
    css.labelSection,
    labelSectionClassName,
  );
  const labelClasses = classNames(labelClassName, css.label);

  const contentClasses = classNames(contentClassName, css.content, {
    [css.isClose]: !isOpen,
  });

  return (
    <div className={classes}>
      <InlineTextButton
        type="button"
        onClick={toggle}
        className={labelSectionClasses}>
        <div className={labelClasses}>{label}</div>
        <IconArrow direction={'down'} className={css.arrowIcon} />
      </InlineTextButton>
      <div className={contentClasses}>{children}</div>
    </div>
  );
};

export default Collapsible;
