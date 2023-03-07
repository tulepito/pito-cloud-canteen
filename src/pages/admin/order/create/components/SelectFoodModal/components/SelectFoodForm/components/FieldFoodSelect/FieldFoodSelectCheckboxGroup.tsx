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

import ValidationError from '@components/ValidationError/ValidationError';
import type { TDefaultProps } from '@utils/types';

import FieldFoodSelectCheckbox from './FieldFoodSelectCheckbox';

import css from './FieldFoodSelectCheckboxGroup.module.scss';

type TFieldFoodSelectCheckboxGroupRendererProps = TDefaultProps & {
  label?: string | ReactNode;
  twoColumns?: boolean;
  id?: string;
  fields: any;
  options: any[];
  meta: any;
  name: string;
};

const FieldFoodSelectCheckboxGroupRenderer: React.FC<
  TFieldFoodSelectCheckboxGroupRendererProps
> = (props) => {
  const {
    className,
    rootClassName,
    twoColumns,
    id,
    fields: { name },
    options,
    meta,
  } = props;

  const classes = classNames(rootClassName || css.root, className);
  const listClasses = twoColumns
    ? classNames(css.list, css.twoColumns)
    : css.list;

  return (
    <fieldset className={classes}>
      <ul className={listClasses}>
        {options.map((option: any) => {
          const fieldId = `${id}.${option.key}`;

          return (
            <li key={fieldId} className={css.foodItem}>
              <FieldFoodSelectCheckbox
                id={fieldId}
                name={name}
                value={option.key}
                foodData={option}
                svgClassName={css.checkbox}
              />
            </li>
          );
        })}
      </ul>
      <ValidationError fieldMeta={meta} />
    </fieldset>
  );
};

const FieldFoodSelectCheckboxGroup: React.FC<any> = (props) => (
  <FieldArray {...props} component={FieldFoodSelectCheckboxGroupRenderer} />
);

export default FieldFoodSelectCheckboxGroup;
