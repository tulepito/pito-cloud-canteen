import React from 'react';
import type { FieldProps } from 'react-final-form';
import { Field } from 'react-final-form';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import type { TDefaultProps, TFormEvent, TIconProps } from '@utils/types';
import { required } from '@utils/validators';

import css from './FieldCheckbox.module.scss';

type IconCheckboxProps = TIconProps & {
  checkedClassName?: string;
  boxClassName?: string;
};

export const IconCheckbox: React.FC<IconCheckboxProps> = (props) => {
  const { rootClassName, className, checkedClassName, boxClassName } = props;
  const rootClasses = classNames(rootClassName || css.iconRoot, className);

  return (
    <svg
      preserveAspectRatio="none"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={rootClasses}>
      <rect
        className={checkedClassName || css.checked}
        x="0.5"
        y="0.5"
        width="19"
        height="19"
        rx="3.5"
      />
      <path
        className={boxClassName || css.box}
        d="M16.0156 6.17188L8.35938 13.8278L4.53125 10"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className={css.boxHover}
        d="M3.98438 10H16.0156"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const CHECKBOX_TEXT_PREFIX = 'Other';

type TFieldCheckboxProps = FieldProps<string, any> &
  TDefaultProps & {
    svgClassName?: string;
    textClassName?: string;
    useSuccessColor?: boolean;
    customOnChange?: (event: React.ChangeEvent | any) => void;
    label?: string | React.ReactNode;
    checkboxWrapperClassName?: string;
  };

const FieldCheckbox: React.FC<TFieldCheckboxProps> = (props) => {
  const {
    rootClassName,
    className,
    svgClassName,
    textClassName,
    id,
    label,
    useSuccessColor,
    customOnChange,
    disabled,
    hasTextInput,
    textPlaceholder,
    labelClassName,
    checkboxWrapperClassName,
    ...rest
  } = props;

  const intl = useIntl();

  const classes = classNames(rootClassName || css.root, className);
  // This is a workaround for a bug in Firefox & React Final Form.
  // https://github.com/final-form/react-final-form/issues/134
  const handleOnChange = (input: any, event: TFormEvent): void => {
    if (disabled) return;
    const { onBlur, onChange } = input;
    if (customOnChange) {
      customOnChange(event);
    } else {
      onChange(event);
    }

    onBlur(event);
  };

  const successColorVariantMaybe = useSuccessColor
    ? {
        checkedClassName: css.checkedSuccess,
        boxClassName: css.boxSuccess,
      }
    : {};

  return (
    <>
      <span className={classes}>
        <Field type="checkbox" {...rest}>
          {(formRenderProps) => {
            const { input } = formRenderProps;

            return (
              <>
                <input
                  id={id}
                  className={css.input}
                  {...input}
                  disabled={disabled}
                  onChange={(event: TFormEvent) => handleOnChange(input, event)}
                />
                {label && (
                  <label
                    htmlFor={id}
                    className={classNames(css.label, labelClassName)}>
                    <span
                      className={classNames(
                        css.checkboxWrapper,
                        checkboxWrapperClassName,
                      )}>
                      <IconCheckbox
                        className={svgClassName}
                        {...successColorVariantMaybe}
                      />
                    </span>
                    <span
                      className={classNames(
                        css.text,
                        textClassName || css.textRoot,
                      )}>
                      {label}
                    </span>
                  </label>
                )}
                {input.checked && hasTextInput && (
                  <FieldTextInput
                    showText
                    disabled={disabled}
                    placeholder={textPlaceholder}
                    className={css.textInput}
                    name={`${input.name}${CHECKBOX_TEXT_PREFIX}`}
                    id={`${input.name}${CHECKBOX_TEXT_PREFIX}`}
                    validate={required(
                      intl.formatMessage({
                        id: 'FieldCheckbox.contentRequired',
                      }),
                    )}
                  />
                )}
              </>
            );
          }}
        </Field>
      </span>
    </>
  );
};

export default FieldCheckbox;
