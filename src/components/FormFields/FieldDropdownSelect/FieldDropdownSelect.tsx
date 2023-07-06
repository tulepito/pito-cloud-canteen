import { useEffect, useState } from 'react';
import type { FieldRenderProps } from 'react-final-form';
import { Field } from 'react-final-form';
import classNames from 'classnames';
import find from 'lodash/find';

import IconArrow from '@components/Icons/IconArrow/IconArrow';
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
    initialFieldValue,
    ...rest
  } = props;
  const [selected, setSelected] = useState<string>(initialFieldValue!);
  const { onChange } = input;

  useEffect(() => {
    onChange(selected);
  }, [onChange, selected]);
  const classes = classNames(css.root);
  const labelClasses = classNames(css.label);

  const inputProps = {
    ...input,
    ...rest,
  };

  const onSelectOption = (optionKey: string) => () => {
    setSelected(optionKey);
    dropdownController.setFalse();
  };

  return (
    <div className={classes}>
      {label ? (
        <label htmlFor={id} className={labelClasses}>
          {label}
          {required && <span>*</span>}
        </label>
      ) : null}
      <div className={css.fieldWrapper} onClick={dropdownController.toggle}>
        <IconArrow
          direction="right"
          className={classNames(
            css.icon,
            dropdownController.value && css.rotate,
          )}
        />
        <RenderWhen condition={!selected}>
          {placeholder && (
            <span className={css.placeholder}>{placeholder}</span>
          )}
          <RenderWhen.False>
            <span className={css.value}>
              {find(options, (_option: any) => _option.key === selected)?.label}
            </span>
          </RenderWhen.False>
        </RenderWhen>
      </div>
      <RenderWhen condition={dropdownController.value}>
        <div className={css.dropdownWrapper}>
          {options.map((option: { key: string; label: string }) => (
            <div
              key={option.key}
              onClick={onSelectOption(option.key)}
              className={classNames(
                css.dropdownItem,
                selected === option.key && css.selected,
              )}>
              {option.label}
            </div>
          ))}
        </div>
      </RenderWhen>
      <input type="hidden" {...inputProps} />

      <ValidationError fieldMeta={meta} />
    </div>
  );
};

const FieldDropdownSelect = (props: any) => {
  return <Field component={FieldDropdownSelectComponent} {...props} />;
};

export default FieldDropdownSelect;
