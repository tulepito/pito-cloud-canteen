import IconCheckmark from '@components/IconCheckmark/IconCheckmark';
import IconSpinner from '@components/IconSpinner/IconSprinner';
import classNames from 'classnames';
import type { PropsWithChildren } from 'react';
import React, { useEffect, useRef } from 'react';

import css from './Button.module.scss';

type TButtonSize = 'large' | 'medium' | 'small';

type TButton = {
  rootClassName?: string;
  className?: string;
  spinnerClassName?: string;
  inProgress?: boolean;
  ready?: boolean;
  disabled?: boolean;
  checkmarkClassName?: string;
  buttonSize?: TButtonSize;
} & React.ComponentProps<'button'>;

const getButtonSizeClassName = (size: string) => {
  switch (size) {
    case 'small':
      return css.smallButton;
    case 'medium':
      return css.mediumButton;
    case 'large':
      return css.largeButton;
    default:
      return css.mediumButton;
  }
};

const Button = (props: PropsWithChildren<TButton>) => {
  const {
    rootClassName,
    className,
    spinnerClassName,
    inProgress = false,
    ready = false,
    disabled = false,
    children,
    checkmarkClassName,
    buttonSize = 'medium',
    ...rest
  } = props;

  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
  }, []);

  let content;
  if (inProgress) {
    content = <IconSpinner rootClassName={spinnerClassName || css.spinner} />;
  } else if (ready) {
    content = (
      <IconCheckmark rootClassName={checkmarkClassName || css.checkmark} />
    );
  } else {
    content = children;
  }
  const buttonSizeClassName = getButtonSizeClassName(buttonSize);
  const classes = classNames(
    rootClassName || css.root,
    className,
    buttonSizeClassName,
    {
      [css.ready]: ready,
      [css.inProgress]: inProgress,
    },
  );

  // All buttons are disabled until the component is mounted. This
  // prevents e.g. being able to submit forms to the backend before
  // the client side is handling the submit.
  const buttonDisabled = mounted.current ? disabled : true;

  return (
    <button className={classes} {...rest} disabled={buttonDisabled}>
      {content}
    </button>
  );
};

export default Button;
