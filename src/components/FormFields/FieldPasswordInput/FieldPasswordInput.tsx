import type { DetailedHTMLProps, InputHTMLAttributes } from 'react';
import React from 'react';
import type { FieldRenderProps } from 'react-final-form';
import { Field } from 'react-final-form';
import classNames from 'classnames';

import IconHidePassword from '@components/Icons/IconHidePassword/IconHidePassword';
import IconShowPassword from '@components/Icons/IconShowPassword/IconShowPassword';
import ValidationError from '@components/ValidationError/ValidationError';
import useBoolean from '@hooks/useBoolean';
import type { TDefaultProps, TIconProps } from '@utils/types';

import css from './FieldPasswordInput.module.scss';

type TIconComponent = React.ReactElement<TIconProps>;
type InputComponentProps = FieldRenderProps<string, HTMLInputElement> &
  DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> &
  TDefaultProps & {
    id: string;
    label?: string;
    inputRootClass?: string;
    disabled?: boolean;
    labelClassName?: string;
    customErrorText?: string;
    errorClass?: string;
    isUncontrolled?: boolean;
    inputRef?: any;
    leftIcon?: TIconComponent;
    fullWidth?: boolean;
    required?: boolean;
    shouldHideEyeIcon?: boolean;
  };

export const FieldPasswordInputComponent: React.FC<InputComponentProps> = (
  props,
) => {
  const showPasswordControl = useBoolean(false);
  const {
    label,
    id,
    rootClassName,
    className,
    inputRootClass,
    disabled,
    labelClassName,
    errorClass,
    customErrorText,
    isUncontrolled = false,
    fullWidth = true,
    input,
    meta,
    inputRef,
    leftIcon,
    required = false,
    shouldHideEyeIcon,
    ...rest
  } = props;

  if (label && !id) {
    throw Error('id required when a label is given');
  }

  const { valid, invalid, touched, error } = meta;
  const errorText = customErrorText || error;

  // Error message and input error styles are only shown if the
  // field has been touched and the validation has failed.
  const hasError = !!customErrorText || !!(touched && invalid && error);
  const fieldMeta = { touched: hasError, error: errorText };

  // Uncontrolled input uses defaultValue instead of value.
  const { value: defaultValue, ...inputWithoutValue } = input;

  // Use inputRef if it is passed as prop.
  const refMaybe = inputRef ? { ref: inputRef } : {};

  // Handle Icon
  const leftIconElement = leftIcon
    ? React.cloneElement(leftIcon, {
        rootClassName: css.leftIcon,
      })
    : undefined;
  const rightIconElement = showPasswordControl.value ? (
    <IconHidePassword
      rootClassName={css.rightIcon}
      onClick={showPasswordControl.toggle}
    />
  ) : (
    <IconShowPassword
      rootClassName={css.rightIcon}
      onClick={showPasswordControl.toggle}
    />
  );

  // Classes
  const inputClasses =
    inputRootClass ||
    classNames(css.input, css.inputWithPaddingRight, {
      [css.inputSuccess]: valid,
      [css.inputError]: hasError,
      [css.inputDisabled]: disabled,
      [css.inputFullWidth]: fullWidth,
      [css.inputWithPaddingLeft]: !!leftIcon,
    });

  const fieldInputType = showPasswordControl.value ? 'text' : 'password';
  const inputProps = isUncontrolled
    ? {
        className: inputClasses,
        id,
        type: fieldInputType,
        defaultValue,
        ...refMaybe,
        ...inputWithoutValue,
        ...rest,
        ...(disabled ? { disabled } : ''),
      }
    : {
        className: inputClasses,
        id,
        type: fieldInputType,
        ...refMaybe,
        ...input,
        ...rest,
        ...(disabled ? { disabled } : ''),
      };

  const classes = classNames(rootClassName || css.root, className);
  const inputContainerClasses = classNames(css.inputContainer);
  const labelClasses = classNames(css.labelRoot, labelClassName);
  const labelRequiredRedStar = required ? css.labelRequiredRedStar : '';

  return (
    <div className={classes}>
      {label && (
        <label className={labelClasses} htmlFor={id}>
          {label} {required && <span className={labelRequiredRedStar}>*</span>}
        </label>
      )}
      <div className={inputContainerClasses}>
        {!!leftIcon && (
          <div className={css.leftIconContainer}>{leftIconElement}</div>
        )}
        <input {...inputProps} />
        {!shouldHideEyeIcon && (
          <div className={css.rightIconContainer}>{rightIconElement}</div>
        )}
      </div>
      <ValidationError fieldMeta={fieldMeta} className={errorClass} />
    </div>
  );
};

const FieldPasswordInput = (props: any) => {
  return <Field component={FieldPasswordInputComponent} {...props} />;
};

export default FieldPasswordInput;
