import ValidationError from '@components/ValidationError/ValidationError';
import classNames from 'classnames';
import React from 'react';
import { Field } from 'react-final-form';

import css from './FieldSelect.module.scss';

const handleChange =
  (propsOnChange: (e: any) => void, inputOnChange: (e: any) => void) =>
  (event: any) => {
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

const FieldSelectComponent: React.FC<any> = (props) => {
  const {
    rootClassName,
    className,
    selectClassName,
    id,
    label,
    input,
    meta,
    children,
    onChange,
    ...rest
  } = props;

  if (label && !id) {
    throw new Error('id required when a label is given');
  }

  const { valid, invalid, touched, error } = meta;

  // Error message and input error styles are only shown if the
  // field has been touched and the validation has failed.
  const hasError = touched && invalid && error;

  const selectClasses = classNames(selectClassName, css.select, {
    [css.selectSuccess]: input.value && valid,
    [css.selectError]: hasError,
  });

  const { onChange: inputOnChange, ...restOfInput } = input;
  const selectProps = {
    className: selectClasses,
    id,
    onChange: handleChange(onChange, inputOnChange),
    ...restOfInput,
    ...rest,
  };

  const classes = classNames(rootClassName || css.root, className);
  return (
    <div className={classes}>
      {label ? <label htmlFor={id}>{label}</label> : null}
      <select {...selectProps}>{children}</select>
      <ValidationError fieldMeta={meta} />
    </div>
  );
};

const FieldSelect: React.FC<any> = (props) => {
  return <Field component={FieldSelectComponent} {...props} />;
};

export default FieldSelect;
