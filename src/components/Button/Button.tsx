import IconCheckmark from '@components/IconCheckmark/IconCheckmark';
import IconSpinner from '@components/IconSpinner/IconSpinner';
import classNames from 'classnames';
import type { PropsWithChildren } from 'react';
import React, { useEffect, useState } from 'react';

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
  size?: TButtonSize;
  fullWidth?: boolean;
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
  const [mounted, setMounted] = useState(false);
  const {
    rootClassName,
    className,
    spinnerClassName,
    inProgress = false,
    ready = false,
    disabled = false,
    children,
    checkmarkClassName,
    size = 'large',
    fullWidth = false,
    ...rest
  } = props;

  useEffect(() => {
    setMounted(true);
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
  const buttonSizeClassName = getButtonSizeClassName(size);
  const classes = classNames(
    rootClassName || css.root,
    className,
    buttonSizeClassName,
    {
      [css.ready]: ready,
      [css.inProgress]: inProgress,
      [css.buttonFullWidth]: fullWidth,
    },
  );

  // All buttons are disabled until the component is mounted. This
  // prevents e.g. being able to submit forms to the backend before
  // the client side is handling the submit.
  const buttonDisabled = mounted ? disabled : true;

  return (
    <button className={classes} {...rest} disabled={buttonDisabled}>
      {content}
    </button>
  );
};

export const InlineTextButton = (props: TButton) => {
  const classes = classNames(
    props.rootClassName || css.inlineTextButtonRoot,
    css.inlineTextButton,
  );

  const { type = 'button', ...rest } = props;

  return <Button {...rest} type={type} rootClassName={classes} />;
};
InlineTextButton.displayName = 'InlineTextButton';

export default Button;
