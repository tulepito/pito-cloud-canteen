import React from 'react';
import type { FieldArrayProps } from 'react-final-form-arrays';
import { FieldArray } from 'react-final-form-arrays';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import ValidationError from '@components/ValidationError/ValidationError';
import { EDayOfWeek } from '@utils/enums';
import type { TObject } from '@utils/types';

import FieldCheckbox from '../FieldCheckbox/FieldCheckbox';

import css from './FieldDaysOfWeekCheckboxGroup.module.scss';

const defaultDaysOfWeek = Object.keys(EDayOfWeek);

type TFieldDaysOfWeekCheckboxGroup = {
  name: string;
  values: TObject;
  label?: string;
  rootClassName?: string;
  className?: string;
  daysOfWeek?: EDayOfWeek[];
  disabled?: boolean;
} & FieldArrayProps<any, any>;

const FieldDaysOfWeekCheckboxGroupComponent: React.FC<
  TFieldDaysOfWeekCheckboxGroup
> = (props) => {
  const {
    fields,
    values,
    label,
    rootClassName,
    className,
    meta,
    daysOfWeek,
    disabled,
  } = props;

  const intl = useIntl();
  const { name } = fields;
  const classes = classNames(rootClassName || css.root, className);
  const daysOfWeekToRender =
    (daysOfWeek && daysOfWeek.length > 0 && daysOfWeek) || defaultDaysOfWeek;

  return (
    <div className={classes}>
      {label && <label className={css.label}>{label}</label>}
      <div className={css.dayPicker}>
        {daysOfWeekToRender.map((day) => {
          return (
            <div
              key={day as any}
              className={classNames(css.dayButton, {
                [css.active]: values[name]?.includes(day),
                [css.disabled]: disabled,
              })}>
              <FieldCheckbox
                className={css.checkbox}
                id={`${name}.${day}`}
                name={name}
                value={day as string}
                disabled={disabled}
              />
              <label htmlFor={`${name}.${day}`} key={day as string}>
                {intl.formatMessage({
                  id: `FieldDaysOfWeekCheckboxGroup.${day}Label`,
                })}
              </label>
            </div>
          );
        })}
      </div>
      <ValidationError fieldMeta={meta} />
    </div>
  );
};

const FieldDaysOfWeekCheckboxGroup: React.FC<any> = (props) => (
  <FieldArray component={FieldDaysOfWeekCheckboxGroupComponent} {...props} />
);

export default FieldDaysOfWeekCheckboxGroup;
