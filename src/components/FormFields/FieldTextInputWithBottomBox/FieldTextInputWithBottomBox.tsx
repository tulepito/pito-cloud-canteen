import React, { useState } from 'react';
import type { FieldProps, FieldRenderProps } from 'react-final-form';
import { Field } from 'react-final-form';
import classNames from 'classnames';

import IconClose from '@components/Icons/IconClose/IconClose';
import ValidationError from '@components/ValidationError/ValidationError';

import css from './FieldTextInputWithBottomBox.module.scss';

const FieldTextInputWithBottomBoxComponent: React.FC<
  FieldRenderProps<string, any>
> = (props) => {
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
    required,
    showText = false,
    form,
    ...rest
  } = props;
  const [tempValue, setTempValue] = useState<number | string>();
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

  const onChangeTempValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempValue(e.target.value);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.key === 'Enter') {
      form.change(input.name, [tempValue]);
    }
  };

  const removeValue = () => {
    form.change(input.name, null);
  };

  const classes = classNames(rootClassName || css.root, className);
  const inputContainerClasses = classNames(css.inputContainer);
  const labelClasses = classNames(css.labelRoot, labelClassName);
  const labelRequiredRedStar = required ? css.labelRequiredRedStar : '';
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
          <input
            {...inputProps}
            value={tempValue}
            id={id}
            onChange={onChangeTempValue}
            onKeyUp={onKeyDown}
          />
        </div>
      )}
      {input.value && (
        <div className={css.boxValue}>
          <span>{input.value}</span>
          <IconClose onClick={removeValue} className={css.iconClose} />
        </div>
      )}
      <ValidationError fieldMeta={fieldMeta} />
    </div>
  );
};

const FieldTextInputWithBottomBox: React.FC<FieldProps<string, any>> = (
  props,
) => {
  return <Field {...props} component={FieldTextInputWithBottomBoxComponent} />;
};

export default FieldTextInputWithBottomBox;
