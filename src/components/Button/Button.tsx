import type { PropsWithChildren } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';

import IconCheckmark from '@components/Icons/IconCheckmark/IconCheckmark';
import IconSpinner from '@components/Icons/IconSpinner/IconSpinner';
import type { TDefaultProps } from '@utils/types';

import css from './Button.module.scss';

export type TButtonSize = 'large' | 'medium' | 'small';
export type TButtonVariant = 'primary' | 'secondary' | 'cta' | 'inline';
export type TButtonLoadingMode = 'replace' | 'extend';

export type TButtonProps = PropsWithChildren<
  TDefaultProps & {
    spinnerClassName?: string;
    inProgress?: boolean;
    loadingMode?: TButtonLoadingMode;
    ready?: boolean;
    disabled?: boolean;
    checkmarkClassName?: string;
    size?: TButtonSize;
    variant?: TButtonVariant;
    fullWidth?: boolean;
  }
> &
  React.ComponentProps<'button'>;

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

const Button: React.FC<TButtonProps> = (props) => {
  const [mounted, setMounted] = useState(false);
  const {
    rootClassName,
    className,
    spinnerClassName,
    inProgress = false,
    loadingMode = 'replace',
    ready = false,
    disabled = false,
    children,
    checkmarkClassName,
    size = 'large',
    fullWidth = false,
    variant = 'primary',
    ...rest
  } = props;

  useEffect(() => {
    setMounted(true);
  }, []);

  let content;
  if (inProgress) {
    if (loadingMode === 'replace') {
      content = <IconSpinner className={spinnerClassName || css.spinner} />;
    } else {
      content = (
        <>
          {children}
          <IconSpinner
            className={classNames(
              spinnerClassName || css.spinner,
              css.extendSpinner,
            )}
          />
        </>
      );
    }
  } else if (ready) {
    content = (
      <IconCheckmark rootClassName={checkmarkClassName || css.checkmark} />
    );
  } else {
    content = children;
  }
  const buttonSizeClasses = getButtonSizeClassName(size);
  const classes = classNames(
    rootClassName || css.root,
    buttonSizeClasses,
    {
      [css.secondaryStyle]: variant === 'secondary',
      [css.CTAStyle]: variant === 'cta',
      [css.inlineStyle]: variant === 'inline',
    },
    {
      [css.ready]: ready,
      [css.inProgress]: inProgress,
      [css.buttonFullWidth]: fullWidth,
    },
    className,
  );

  // All buttons are disabled until the component is mounted. This
  // prevents e.g. being able to submit forms to the backend before
  // the client side is handling the submit.
  const buttonDisabled = mounted ? disabled : true;
  // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle
  const _onClick = buttonDisabled ? () => {} : props.onClick;

  return (
    <button
      className={classes}
      {...rest}
      disabled={buttonDisabled}
      onClick={_onClick}>
      {content}
    </button>
  );
};

export const InlineTextButton: React.FC<TButtonProps> = (props) => {
  const classes = classNames(
    props.rootClassName || css.inlineTextButtonRoot,
    css.inlineTextButton,
  );

  const { type = 'button', ...rest } = props;

  return <Button {...rest} type={type} rootClassName={classes} />;
};

InlineTextButton.displayName = 'InlineTextButton';

export default Button;
