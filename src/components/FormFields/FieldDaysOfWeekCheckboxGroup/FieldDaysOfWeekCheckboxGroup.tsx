import { EDayOfWeek } from '@utils/enums';
import classNames from 'classnames';
import React from 'react';
import { useIntl } from 'react-intl';

import FieldCheckbox from '../FieldCheckbox/FieldCheckbox';
import css from './FieldDaysOfWeekCheckboxGroup.module.scss';

const daysOfWeek = Object.keys(EDayOfWeek);

type TFieldDaysOfWeekCheckboxGroup = {
  name: string;
  values: Record<any, any>;
  label?: string;
};

const FieldDaysOfWeekCheckboxGroup: React.FC<TFieldDaysOfWeekCheckboxGroup> = (
  props,
) => {
  const { name, values, label } = props;
  const intl = useIntl();
  return (
    <div className={css.root}>
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
    </div>
  );
};

export default FieldDaysOfWeekCheckboxGroup;
