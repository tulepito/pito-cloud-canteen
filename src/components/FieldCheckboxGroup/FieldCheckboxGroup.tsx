/*
 * Renders a group of checkboxes that can be used to select
 * multiple values from a set of options.
 *
 * The corresponding component when rendering the selected
 * values is PropertyGroup.
 *
 */

import FieldCheckbox from '@components/FieldCheckbox/FieldCheckbox';
import ValidationError from '@components/ValidationError/ValidationError';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import React from 'react';
import { FieldArray } from 'react-final-form-arrays';

import css from './FieldCheckboxGroup.module.scss';

type TFieldCheckboxRenderer = {
  className?: string;
  rootClassName?: string;
  label?: string | ReactNode;
  twoColumns?: boolean;
  id?: string;
  fields: any;
  options: any[];
  meta: any;
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
  } = props;

  const classes = classNames(rootClassName || css.root, className);
  const listClasses = twoColumns
    ? classNames(css.list, css.twoColumns)
    : css.list;

  return (
    <fieldset className={classes}>
      {label ? <legend>{label}</legend> : null}
      <ul className={listClasses}>
        {options.map((option: any) => {
          const fieldId = `${id}.${option.key}`;
          return (
            <li key={fieldId} className={css.item}>
              <FieldCheckbox
                id={fieldId}
                name={fields.name}
                label={option.label}
                value={option.key}
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
