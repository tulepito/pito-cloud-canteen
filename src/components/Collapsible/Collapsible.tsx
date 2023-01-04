import { InlineTextButton } from '@components/Button/Button';
import IconArrow from '@components/IconArrow/IconArrow';
import useBoolean from '@hooks/useBoolean';
import classNames from 'classnames';
import type { MutableRefObject, PropsWithChildren, ReactNode } from 'react';
import React, { useRef } from 'react';

import css from './Collapsible.module.scss';

type TCollapsible = {
  rootClassName?: string;
  className?: string;
  label: string | ReactNode | number;
  labelSectionClassName?: string;
  labelClassName?: string;
  contentClassName?: string;
};

const Collapsible: React.FC<PropsWithChildren<TCollapsible>> = (props) => {
  const {
    className,
    rootClassName,
    label,
    labelClassName,
    labelSectionClassName,
    children,
    contentClassName,
  } = props;

  const contentRef = useRef() as MutableRefObject<HTMLDivElement>;

  const { value: isOpen, toggle } = useBoolean(true);
  const classes = classNames(rootClassName || css.root, className, {
    [css.isOpen]: isOpen,
  });
  const labelSectionClasses = classNames(
    labelSectionClassName,
    css.labelSection,
  );
  const labelClasses = classNames(labelClassName, css.label);

  const contentClasses = classNames(contentClassName, css.content);

  return (
    <div className={classes}>
      <InlineTextButton
        type="button"
        onClick={toggle}
        className={labelSectionClasses}>
        <div className={labelClasses}>{label}</div>
        <IconArrow
          direction={isOpen ? 'up' : 'down'}
          className={css.arrowIcon}
        />
      </InlineTextButton>
      <div
        ref={contentRef}
        style={
          isOpen
            ? { height: `${contentRef.current?.scrollHeight}px` }
            : { height: '0px' }
        }
        className={contentClasses}>
        {children}
      </div>
    </div>
  );
};

export default Collapsible;
