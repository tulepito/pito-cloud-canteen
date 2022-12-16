import ValidationError from '@components/ValidationError/ValidationError';
import type { TIconProps } from '@utils/types';
import classNames from 'classnames';
import React from 'react';
import type { FieldProps, FieldRenderProps } from 'react-final-form';
import { Field } from 'react-final-form';

import css from './FieldTextInput.module.scss';

type TIconComponent = React.ReactElement<TIconProps>;
interface InputComponentProps extends FieldRenderProps<string, any> {
  id: string;
  label?: string;
  rootClassName?: string;
  className?: string;
  inputRootClass?: string;
  disabled?: boolean;
  labelClassName?: string;
  customErrorText?: string;
  isUncontrolled?: boolean;
  input: any;
  meta: any;
  inputRef: any;
  fullWidth?: boolean;
  leftIcon?: TIconComponent;
  rightIcon?: TIconComponent;
  required?: boolean;
}

const FieldTextInputComponent = (props: InputComponentProps) => {
  const {
    label,
    id,
    rootClassName,
    className,
    inputRootClass,
    disabled,
    labelClassName,
    customErrorText,
    isUncontrolled = false,
    fullWidth = true,
    input,
    meta,
    inputRef,
    leftIcon,
    rightIcon,
    required = false,
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

  const { type } = input;

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
  const rightIconElement = rightIcon
    ? React.cloneElement(rightIcon, {
        rootClassName: css.rightIcon,
      })
    : undefined;

  // Classes
  const inputClasses =
    inputRootClass ||
    classNames(css.input, {
      [css.inputSuccess]: valid,
      [css.inputError]: hasError,
      [css.inputDisabled]: disabled,
      [css.inputFullWidth]: fullWidth,
      [css.inputWithPaddingLeft]: !!leftIcon,
      [css.inputWithPaddingRight]: !!rightIcon,
    });

  const inputProps = isUncontrolled
    ? {
        className: inputClasses,
        id,
        type,
        defaultValue,
        ...refMaybe,
        ...inputWithoutValue,
        ...rest,
        ...(disabled ? { disabled } : ''),
      }
    : {
        className: inputClasses,
        id,
        type,
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
        <div className={css.rightIconContainer}>{rightIconElement}</div>
      </div>
      <ValidationError fieldMeta={fieldMeta} />
    </div>
  );
};

const FieldTextInput = (props: FieldProps<string, any>) => {
  return <Field component={FieldTextInputComponent} {...props} />;
};

export default FieldTextInput;
