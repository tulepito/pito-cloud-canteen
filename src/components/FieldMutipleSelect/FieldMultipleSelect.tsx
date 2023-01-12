import FieldCheckbox from '@components/FieldCheckbox/FieldCheckbox';
import OutsideClickHandler from '@components/OutsideClickHandler/OutsideClickHandler';
import useBoolean from '@hooks/useBoolean';
import classNames from 'classnames';
import React from 'react';
import { Field } from 'react-final-form';

import css from './FieldMultipleSelect.module.scss';

const getLabelByKey = (list: any[], key: any) => {
  const item = list?.find((l: any) => l.key === key);
  return item && item.label ? item.label : key;
};

const FieldMutipleSelectComponent = (props: any) => {
  const { options, placeholder, className, label, input } = props;
  const { value: isOpen, toggle, setFalse: onClose } = useBoolean(false);
  const { value = [], name } = input;
  const hasValues = value.length > 0;
  const unCheck = (newVal: string) => (e) => {
    e.stopPropagation();
    input.onChange(value.filter((val: string) => val !== newVal));
  };
  return (
    <OutsideClickHandler onOutsideClick={onClose}>
      <div className={classNames(css.root, className)}>
        <label className={css.labelRoot}>{label}</label>
        <div onClick={toggle} className={css.input}>
          {!hasValues ? (
            <span className={css.placeholder}>{placeholder}</span>
          ) : (
            value.map((val: string) => (
              <div onClick={unCheck(val)} key={val} className={css.pickedItem}>
                {getLabelByKey(options, val)}
              </div>
            ))
          )}
        </div>
        <div className={classNames(css.dropdown, { [css.isOpen]: isOpen })}>
          {options.map((opt: any) => (
            <FieldCheckbox
              id={opt.key}
              key={opt.key}
              className={css.item}
              label={opt.label}
              labelClassName={css.itemLabel}
              name={name}
              value={opt.key}
            />
          ))}
        </div>
      </div>
    </OutsideClickHandler>
  );
};

const FieldMultipleSelect = (props: any) => {
  return <Field {...props} render={FieldMutipleSelectComponent} />;
};

export default FieldMultipleSelect;
