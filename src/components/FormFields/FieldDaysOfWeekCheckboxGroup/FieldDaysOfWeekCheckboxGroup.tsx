import ValidationError from '@components/ValidationError/ValidationError';
import { EDayOfWeek } from '@utils/enums';
import type { TObject } from '@utils/types';
import classNames from 'classnames';
import React from 'react';
import type { FieldArrayProps } from 'react-final-form-arrays';
import { FieldArray } from 'react-final-form-arrays';
import { useIntl } from 'react-intl';

import FieldCheckbox from '../FieldCheckbox/FieldCheckbox';
import css from './FieldDaysOfWeekCheckboxGroup.module.scss';

const daysOfWeek = Object.keys(EDayOfWeek);

type TFieldDaysOfWeekCheckboxGroup = {
  name: string;
  values: TObject;
  label?: string;
  rootClassName?: string;
  className?: string;
} & FieldArrayProps<any, any>;

const FieldDaysOfWeekCheckboxGroupComponent: React.FC<
  TFieldDaysOfWeekCheckboxGroup
> = (props) => {
  const { fields, values, label, rootClassName, className, meta } = props;
  const intl = useIntl();
  const { name } = fields;
  const classes = classNames(rootClassName || css.root, className);

  return (
    <div className={classes}>
      {label && <label className={css.label}>{label}</label>}
      <div className={css.dayPicker}>
        {daysOfWeek.map((day) => {
          return (
            <div
              key={day}
              className={classNames(css.dayButton, {
                [css.active]: values[name]?.includes(day),
              })}>
              <FieldCheckbox
                className={css.checkbox}
                id={`${name}.${day}`}
                name={name}
                value={day}
              />
              <label htmlFor={`${name}.${day}`} key={day}>
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
