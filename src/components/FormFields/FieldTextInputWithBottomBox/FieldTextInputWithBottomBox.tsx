import type { ReactNode } from 'react';
import React, { useRef } from 'react';
import { Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import classNames from 'classnames';
import type { FormApi } from 'final-form';

import IconClose from '@components/Icons/IconClose/IconClose';
import ValidationError from '@components/ValidationError/ValidationError';

import css from './FieldTextInputWithBottomBox.module.scss';

export type TFieldTextInputWithBottomBox = {
  label: ReactNode | string;
  id: string;
  rootClassName?: string;
  className?: string;
  disabled?: boolean;
  labelClassName?: string;
  required?: boolean;
  showText?: boolean;
  form: FormApi;
  name: string;
  placeholder?: string;
  validate?: any;
};

const FieldTextInputWithBottomBox: React.FC<TFieldTextInputWithBottomBox> = (
  props,
) => {
  const {
    label,
    id,
    rootClassName,
    className,
    disabled,
    labelClassName,
    required,
    showText = false,
    form,
    name,
    placeholder,
    validate,
  } = props;
  const fieldsArrayRef = useRef<any>(null);
  const value = form.getFieldState(name)?.value || [];
  const tempValue = form.getFieldState('tempValue')?.value || '';

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.key === 'Enter') {
      if (tempValue && tempValue.replace(/\s/g, '').length) {
        fieldsArrayRef.current.push(tempValue.trim());
        form.change('tempValue', '');
      }
    }
  };

  const classes = classNames(rootClassName || css.root, className);
  const inputContainerClasses = classNames(css.inputContainer);
  const labelClasses = classNames(css.labelRoot, labelClassName);
  const labelRequiredRedStar = required ? css.labelRequiredRedStar : '';

  return (
    <div className={classes}>
      <div>
        {label && (
          <label className={labelClasses} htmlFor={id}>
            {label}
            {required && <span className={labelRequiredRedStar}>*</span>}
          </label>
        )}
        {disabled && showText ? (
          <p className={css.textValue}>{value}</p>
        ) : (
          <Field name="tempValue" id="tempValue" validate={validate}>
            {({ input, meta }) => {
              const { invalid, touched, error } = meta;

              // Error message and input error styles are only shown if the
              // field has been touched and the validation has failed.
              const hasError = !!(touched && invalid && error);

              const fieldMeta = { touched: hasError, error };

              return (
                <div className={inputContainerClasses}>
                  <input
                    {...input}
                    className={css.input}
                    onKeyUp={onKeyDown}
                    placeholder={placeholder}
                  />
                  <ValidationError fieldMeta={fieldMeta} />
                </div>
              );
            }}
          </Field>
        )}
      </div>
      <FieldArray name={name}>
        {({ fields }) => {
          fieldsArrayRef.current = fields;

          return (
            <div className={css.fieldList}>
              {fields.map((_name, index) => {
                const removeValue = () => {
                  fields.remove(index);
                };

                return (
                  <div
                    key={`${fields.name}[${index}]`}
                    className={css.boxValue}>
                    <span>{fields.value[index]}</span>
                    <IconClose
                      onClick={removeValue}
                      className={css.iconClose}
                    />
                  </div>
                );
              })}
            </div>
          );
        }}
      </FieldArray>
    </div>
  );
};

export default FieldTextInputWithBottomBox;
