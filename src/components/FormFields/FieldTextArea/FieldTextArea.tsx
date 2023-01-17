import ValidationError from '@components/ValidationError/ValidationError';
import classNames from 'classnames';
import React from 'react';
import type { FieldRenderProps } from 'react-final-form';
import { Field } from 'react-final-form';

import css from './FieldTextArea.module.scss';

type InputComponentProps = FieldRenderProps<string, any> & {
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
};
const CONTENT_MAX_LENGTH = 5000;

const FieldTextAreaComponent: React.FC<InputComponentProps> = (props) => {
  const {
    label,
    id,
    rootClassName,
    className,
    inputRootClass,
    disabled,
    labelClassName,
    customErrorText,
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

  // Textarea doesn't need type.
  // eslint-disable-next-line unused-imports/no-unused-vars
  const { type, ...inputWithoutType } = input;

  // Use inputRef if it is passed as prop.
  const refMaybe = inputRef ? { ref: inputRef } : {};

  const maxLength = CONTENT_MAX_LENGTH;
  // Classes
  const inputClasses =
    inputRootClass ||
    classNames(css.input, {
      [css.inputSuccess]: valid,
      [css.inputError]: hasError,
      [css.inputDisabled]: disabled,
      [css.inputFullWidth]: fullWidth,
    });

  const inputProps = {
    className: inputClasses,
    id,
    rows: 1,
    maxLength,
    ...refMaybe,
    ...inputWithoutType,
    ...rest,
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
