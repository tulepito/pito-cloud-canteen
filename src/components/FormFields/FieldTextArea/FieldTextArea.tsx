import React from 'react';
import type { FieldRenderProps } from 'react-final-form';
import { Field } from 'react-final-form';
import classNames from 'classnames';

import ValidationError from '@components/ValidationError/ValidationError';
import type { TDefaultProps } from '@utils/types';

import css from './FieldTextArea.module.scss';

type InputComponentProps = FieldRenderProps<string, any> &
  TDefaultProps & {
    id: string;
    label?: string;
    inputRootClass?: string;
    disabled?: boolean;
    labelClassName?: string;
    customErrorText?: string;
    isUncontrolled?: boolean;
    input: any;
    meta: any;
    inputRef?: any;
    fullWidth?: boolean;
  };
const CONTENT_MAX_LENGTH = 5000;

const handleChange =
  (propsOnChange: any, inputOnChange: any) => (event: any) => {
    // If "onChange" callback is passed through the props,
    // it can notify the parent when the content of the input has changed.
    if (propsOnChange) {
      // "handleChange" function is attached to the low level <select> component
      // value of the element needs to be picked from target
      const { value } = event.nativeEvent.target;
      propsOnChange(value);
    }
    // Notify Final Form that the input has changed.
    // (Final Form knows how to deal with synthetic events of React.)
    inputOnChange(event);
  };

export const FieldTextAreaComponent: React.FC<InputComponentProps> = (
  props,
) => {
  const {
    label,
    id,
    rootClassName,
    className,
    inputRootClass,
    inputClassName,
    disabled,
    labelClassName,
    customErrorText,
    fullWidth = true,
    input,
    meta,
    inputRef,
    onChange,
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

  // Textarea doesn't need type.
  // eslint-disable-next-line unused-imports/no-unused-vars
  const { type, onChange: inputOnChange, ...inputWithoutType } = input;

  // Use inputRef if it is passed as prop.
  const refMaybe = inputRef ? { ref: inputRef } : {};

  const maxLength = CONTENT_MAX_LENGTH;
  // Classes
  const inputClasses =
    inputRootClass ||
    classNames(
      css.input,
      {
        [css.inputSuccess]: valid,
        [css.inputError]: hasError,
        [css.inputDisabled]: disabled,
        [css.inputFullWidth]: fullWidth,
      },
      inputClassName,
    );

  const inputProps = {
    className: inputClasses,
    id,
    rows: 1,
    maxLength,
    ...refMaybe,
    ...inputWithoutType,
    ...rest,
    onChange: handleChange(onChange, inputOnChange),
    ...(disabled ? { disabled } : ''),
  };
  const classes = classNames(rootClassName || css.root, className);
  const inputContainerClasses = classNames(css.inputContainer);

  const labelClasses = classNames(css.labelRoot, labelClassName);
  const labelRequiredRedStar = fieldMeta.error ? css.labelRequiredRedStar : '';

  return (
    <div className={classes}>
      {label && (
        <label className={labelClasses} htmlFor={id}>
          {label}
          {fieldMeta.error && <span className={labelRequiredRedStar}>*</span>}
        </label>
      )}
      <div className={inputContainerClasses}>
        <textarea {...inputProps} />
      </div>
      <ValidationError fieldMeta={fieldMeta} />
    </div>
  );
};

const FieldTextArea = (props: any) => {
  return <Field component={FieldTextAreaComponent} {...props} />;
};

export default FieldTextArea;
