import ValidationError from '@components/ValidationError/ValidationError';
import classNames from 'classnames';
import React from 'react';
import type { FieldRenderProps } from 'react-final-form';
import { Field } from 'react-final-form';

import css from './FieldTextInput.module.scss';

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
}

const FieldTextInputComponent: React.FC<InputComponentProps> = (
  props: InputComponentProps,
) => {
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

  const inputClasses =
    inputRootClass ||
    classNames(css.input, {
      [css.inputSuccess]: valid,
      [css.inputError]: hasError,
      [css.inputDisabled]: disabled,
      [css.inputFullWidth]: fullWidth,
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
  return (
    <div className={classes}>
      {label && (
        <label className={labelClassName} htmlFor={id}>
          {label}
        </label>
      )}
      <div className={css.inputContainer}>
        <input {...inputProps} />
      </div>
      <ValidationError fieldMeta={fieldMeta} />
    </div>
  );
};

const FieldTextInput = (props: any) => {
  return <Field component={FieldTextInputComponent} {...props} />;
};

export default FieldTextInput;
