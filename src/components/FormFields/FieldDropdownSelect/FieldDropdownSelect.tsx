import { cloneElement } from 'react';
import type { FieldRenderProps } from 'react-final-form';
import { Field } from 'react-final-form';
import classNames from 'classnames';
import find from 'lodash/find';

import IconArrow from '@components/Icons/IconArrow/IconArrow';
import OutsideClickHandler from '@components/OutsideClickHandler/OutsideClickHandler';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import ValidationError from '@components/ValidationError/ValidationError';
import useBoolean from '@hooks/useBoolean';
import type { TKeyValue } from '@src/utils/types';

import css from './FieldDropdownSelect.module.scss';

type TFieldDropdownSelect = FieldRenderProps<string, any> & {
  label?: string;
  id?: string;
  options?: TKeyValue[];
  initialFieldValue?: string;
  labelClassName?: string;
  dropdownWrapperClassName?: string;
};
export const FieldDropdownSelectComponent: React.FC<TFieldDropdownSelect> = (
  props,
) => {
  const dropdownController = useBoolean();
  const {
    label,
    id,
    required,
    input,
    meta,
    placeholder,
    options = [],
    labelClassName,
    className,
    fieldWrapperClassName,
    disabled,
    labelWrapperClassName,
    dropdownWrapperClassName,
    customOnChange,
    leftIcon,
    ...rest
  } = props;
  const { onChange, value } = input;

  const classes = classNames(css.root, className);
  const labelClasses = classNames(css.label, labelClassName);
  const labelWrapperClasses = classNames(
    css.labelWrapper,
    labelWrapperClassName,
  );

  const fieldWrapperClasses = classNames(
    css.fieldWrapper,
    fieldWrapperClassName,
    { [css.fieldDisabled]: disabled },
  );
  const inputProps = {
    ...input,
    ...rest,
  };

  const onSelectOption = (optionKey: string) => () => {
    if (onChange) {
      onChange(optionKey);
    }

    if (customOnChange) {
      customOnChange(optionKey);
    }
    dropdownController.setFalse();
  };

  const leftIconElement = leftIcon
    ? cloneElement(leftIcon, {
        rootClassName: css.leftIcon,
      })
    : undefined;

  const valueClasses = classNames(css.value, {
    [css.paddingWithLeftIcon]: !!leftIcon,
  });

  const placeholderClasses = classNames(css.placeholder, {
    [css.paddingWithLeftIcon]: !!leftIcon,
  });
  const dropdownWrapperClasses = classNames(
    css.dropdownWrapper,
    dropdownWrapperClassName,
  );

  return (
    <OutsideClickHandler
      onOutsideClick={dropdownController.setFalse}
      className={classes}>
      {label ? (
        <div className={labelWrapperClasses}>
          <label htmlFor={id} className={labelClasses}>
            {label}
            {required && <span className={css.requiredStar}>*</span>}
          </label>
        </div>
      ) : null}
      <div className={fieldWrapperClasses} onClick={dropdownController.toggle}>
        {leftIconElement}

        <IconArrow
          direction="right"
          className={classNames(
            css.icon,
            dropdownController.value && css.rotate,
          )}
        />
        <RenderWhen condition={!value}>
          {placeholder && (
            <span className={placeholderClasses}>{placeholder}</span>
          )}
          <RenderWhen.False>
            <span
              className={classNames(valueClasses, 'one-line-text')}
              style={{ width: 'calc(100% - 20px)' }}>
              {find(options, (_option: any) => _option.key === value)?.label ||
                options[0]?.label}
            </span>
          </RenderWhen.False>
        </RenderWhen>
      </div>

      <RenderWhen condition={dropdownController.value}>
        <div className={dropdownWrapperClasses}>
          {options.map(
            (option: { key: string; label: string; disabled?: boolean }) => (
              <div
                key={option.key}
                onClick={onSelectOption(option.key)}
                className={classNames(
                  css.dropdownItem,
                  value === option.key && css.selected,
                  option.disabled && css.fieldDisabled,
                )}>
                <div className="three-line-text">{option.label}</div>
              </div>
            ),
          )}
        </div>
      </RenderWhen>

      <input type="hidden" {...inputProps} />

      <ValidationError fieldMeta={meta} />
    </OutsideClickHandler>
  );
};

const FieldDropdownSelect = (props: any) => {
  return <Field component={FieldDropdownSelectComponent} {...props} />;
};

export default FieldDropdownSelect;
