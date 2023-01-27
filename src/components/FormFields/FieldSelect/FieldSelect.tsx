import ValidationError from '@components/ValidationError/ValidationError';
import type { TIconProps } from '@utils/types';
import classNames from 'classnames';
import type { PropsWithChildren, ReactNode } from 'react';
import React from 'react';
import type { FieldRenderProps } from 'react-final-form';
import { Field } from 'react-final-form';

import css from './FieldSelect.module.scss';

type IFieldSelect = PropsWithChildren<
  FieldRenderProps<string, any> & {
    rootClassName?: string;
    className?: string;
    id?: string;
    label?: string | ReactNode;
    labelClassName?: string;
    selectClassName?: string;
    input: any;
    meta: any;
    onChange?: () => void;
    leftIcon?: React.ReactElement<TIconProps>;
  }
>;

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

export const FieldSelectComponent: React.FC<IFieldSelect> = (props) => {
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
    labelClassName,
    leftIcon,
    required,
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
    [css.paddingWithLeftIcon]: !!leftIcon,
    [css.selectedColor]: !!input.value,
  });

  const { onChange: inputOnChange, ...restOfInput } = input;
  const selectProps = {
    className: selectClasses,
    id,
    onChange: handleChange(onChange, inputOnChange),
    ...restOfInput,
    ...rest,
  };

  const leftIconElement = leftIcon
    ? React.cloneElement(leftIcon, {
        rootClassName: css.leftIcon,
      })
    : undefined;

  const classes = classNames(rootClassName || css.root, className);
  const labelClasses = classNames(css.labelRoot, labelClassName);
  const labelRequiredRedStar = required ? css.labelRequiredRedStar : '';

  return (
    <div className={classes}>
      {label ? (
        <label htmlFor={id} className={labelClasses}>
          {label}
          {required && <span className={labelRequiredRedStar}>*</span>}
        </label>
      ) : null}
      <div className={css.selectContainer}>
        {leftIconElement}
        <select {...selectProps}>{children}</select>
      </div>

      <ValidationError fieldMeta={meta} />
    </div>
  );
};

const FieldSelect = (props: any) => {
  return <Field component={FieldSelectComponent} {...props} />;
};
export default FieldSelect;
