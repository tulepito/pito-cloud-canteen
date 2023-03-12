/*
 * Renders a group of checkboxes that can be used to select
 * multiple values from a set of options.
 *
 * The corresponding component when rendering the selected
 * values is PropertyGroup.
 *
 */

import type { ReactNode } from 'react';
import React from 'react';
import { FieldArray } from 'react-final-form-arrays';
import classNames from 'classnames';

import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import ValidationError from '@components/ValidationError/ValidationError';
import type { TDefaultProps } from '@utils/types';

import css from './FieldCheckboxGroup.module.scss';

type TFieldCheckboxRenderer = TDefaultProps & {
  label?: string | ReactNode;
  twoColumns?: boolean;
  id?: string;
  fields: any;
  options: any[];
  meta: any;
  listClassName?: string;
  disabled?: boolean;
  checkboxClassName?: string;
  labelClassName?: string;
  itemClassName?: string;
};

const FieldCheckboxRenderer: React.FC<TFieldCheckboxRenderer> = (props) => {
  const {
    className,
    rootClassName,
    label,
    twoColumns,
    id,
    fields,
    options,
    meta,
    disabled,
    listClassName,
    checkboxClassName,
    labelClassName,
    itemClassName,
  } = props;

  const classes = classNames(rootClassName || css.root, className);
  const listClasses = twoColumns
    ? classNames(css.list, css.twoColumns, listClassName)
    : classNames(css.list, listClassName);

  return (
    <fieldset className={classes}>
      {label ? (
        <p className={classNames(css.label, labelClassName)}>{label}</p>
      ) : null}
      <ul className={listClasses}>
        {options.map((option: any) => {
          const fieldId = `${id}.${option.key}`;

          return (
            <li key={fieldId} className={classNames(css.item, itemClassName)}>
              <FieldCheckbox
                className={checkboxClassName}
                disabled={disabled}
                id={fieldId}
                name={fields.name}
                label={option.label}
                value={option.key}
                hasTextInput={option.hasTextInput}
                textPlaceholder={option.textPlaceholder}
              />
            </li>
          );
        })}
      </ul>
      <ValidationError fieldMeta={meta} />
    </fieldset>
  );
};

const FieldCheckboxGroup: React.FC<any> = (props) => (
  <FieldArray component={FieldCheckboxRenderer} {...props} />
);

export default FieldCheckboxGroup;
