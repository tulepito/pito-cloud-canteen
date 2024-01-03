import React from 'react';
import type { FieldProps, FieldRenderProps } from 'react-final-form';
import { Field } from 'react-final-form';
import classNames from 'classnames';

import ValidationError from '@components/ValidationError/ValidationError';
import type { TDefaultProps } from '@utils/types';

import css from './FieldTextInput.module.scss';

type TIconComponent = React.ReactElement<any>;
type InputComponentProps = FieldRenderProps<string, any> &
  TDefaultProps & {
    id: string;
    label?: string;
    inputRootClass?: string;
    disabled?: boolean;
    labelClassName?: string;
    customErrorText?: string;
    helperText?: React.ReactNode | string;
    isUncontrolled?: boolean;
    input: any;
    meta: any;
    inputRef?: any;
    fullWidth?: boolean;
    leftIcon?: TIconComponent;
    rightIcon?: TIconComponent;
    required?: boolean;
    showText?: boolean;
    placeholder?: string;
    inputClassName?: string;
    inputContainerClassName?: string;
  };

export const FieldTextInputComponent: React.FC<InputComponentProps> = (
  props,
) => {
  const {
    label,
    id,
    rootClassName,
    className,
    inputRootClass,
    inputContainerClassName,
    disabled,
    labelClassName,
    customErrorText,
    helperText,
    isUncontrolled = false,
    fullWidth = true,
    input,
    meta,
    inputRef,
    leftIcon,
    rightIcon,
    required,
    showText = false,
    leftIconContainerClassName,
    rightIconContainerClassName,
    inputClassName,
    customOnBlur,
    onChange: onCustomChange,
    ...rest
  } = props;

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
        className: css.leftIcon,
      })
    : undefined;
  const rightIconElement = rightIcon
    ? React.cloneElement(rightIcon, {
        ...rightIcon.props,
        className: css.rightIcon,
      })
    : undefined;
  // Classes
  const inputClasses =
    inputRootClass ||
    classNames(css.input, inputClassName, {
      [css.inputSuccess]: valid,
      [css.inputError]: hasError,
      [css.inputDisabled]: disabled,
      [css.inputFullWidth]: fullWidth,
      [css.inputWithPaddingLeft]: !!leftIcon,
      [css.inputWithPaddingRight]: !!rightIcon,
    });

  const onInputChange = (event: any) => {
    if (typeof onCustomChange === 'function') {
      onCustomChange(event);
    } else if (type === 'number') {
      const newValue = event.target.value
        .replace(/\+/g, '-')
        .replace(/[^0-9]/g, '');
      input.onChange(newValue);
    } else {
      input.onChange(event);
    }
  };

  const onInputBlur = (event: any) => {
    if (customOnBlur) {
      customOnBlur(event);
    }

    input.onBlur();
  };

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
        onChange: onInputChange,
        onBlur: onInputBlur,
      }
    : {
        className: inputClasses,
        id,
        type,
        ...refMaybe,
        ...input,
        ...rest,
        ...(disabled ? { disabled } : ''),
        onChange: onInputChange,
        onBlur: onInputBlur,
      };

  const classes = classNames(rootClassName || css.root, className);
  const inputContainerClasses = classNames(
    css.inputContainer,
    inputContainerClassName,
  );
  const labelClasses = classNames(css.labelRoot, labelClassName);
  const labelRequiredRedStar = required ? css.labelRequiredRedStar : '';

  const shouldShowHelperText = !hasError && helperText;

  return (
    <div className={classes}>
      {label && (
        <label className={labelClasses} htmlFor={id}>
          {label}
          {required && <span className={labelRequiredRedStar}>*</span>}
        </label>
      )}
      {disabled && showText ? (
        <p className={css.textValue}>{input.value}</p>
      ) : (
        <div className={inputContainerClasses}>
          {!!leftIcon && (
            <div
              className={classNames(
                css.leftIconContainer,
                leftIconContainerClassName,
              )}>
              {leftIconElement}
            </div>
          )}
          <input {...inputProps} />
          {!!rightIcon && (
            <div
              className={classNames(
                css.rightIconContainer,
                rightIconContainerClassName,
              )}>
              {rightIconElement}
            </div>
          )}
        </div>
      )}
      {shouldShowHelperText && (
        <div className={css.helperText}>{helperText}</div>
      )}
      <ValidationError fieldMeta={fieldMeta} />
    </div>
  );
};

const FieldTextInput = (props: FieldProps<string, any>) => {
  return <Field component={FieldTextInputComponent} {...props} />;
};

export default FieldTextInput;
