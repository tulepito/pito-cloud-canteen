import IconHidePassword from '@components/IconHidePassword/IconHidePassword';
import IconShowPassword from '@components/IconShowPassword/IconShowPassword';
import ValidationError from '@components/ValidationError/ValidationError';
import useBoolean from '@hooks/useBoolean';
import type { TIconProps } from '@utils/types';
import classNames from 'classnames';
import React from 'react';
import type { FieldRenderProps } from 'react-final-form';
import { Field } from 'react-final-form';

import css from './FieldPasswordInput.module.scss';

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
  leftIcon: TIconComponent;
  fullWidth?: boolean;
  required?: boolean;
}

const FieldPasswordInputComponent = (props: InputComponentProps) => {
  const showPasswordControl = useBoolean(false);
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
        <div className={css.rightIconContainer}>{rightIconElement}</div>
      </div>
      <ValidationError fieldMeta={fieldMeta} />
    </div>
  );
};

const FieldPasswordInput = (props: any) => {
  return <Field component={FieldPasswordInputComponent} {...props} />;
};

export default FieldPasswordInput;
