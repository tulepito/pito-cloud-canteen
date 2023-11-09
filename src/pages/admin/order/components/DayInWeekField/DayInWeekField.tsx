import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import differenceBy from 'lodash/differenceBy';

import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import { convertWeekDay, getDayInWeekFromPeriod } from '@utils/dates';
import type { TObject } from '@utils/types';

import css from './DayInWeekField.module.scss';

const DAY_IN_WEEK = [
  { key: 'mon', label: 'DayInWeekField.mon' },
  { key: 'tue', label: 'DayInWeekField.tue' },
  { key: 'wed', label: 'DayInWeekField.wed' },
  { key: 'thu', label: 'DayInWeekField.thu' },
  { key: 'fri', label: 'DayInWeekField.fri' },
  { key: 'sat', label: 'DayInWeekField.sat' },
  { key: 'sun', label: 'DayInWeekField.sun' },
];

type TDayInWeekFieldProps = {
  form: any;
  values: TObject;
  title?: string;
  titleClassName?: string;
  containerClassName?: string;
  fieldGroupClassName?: string;
  disabled?: boolean;
};

const DayInWeekField: React.FC<TDayInWeekFieldProps> = (props) => {
  const {
    form,
    values,
    title,
    containerClassName,
    titleClassName,
    fieldGroupClassName,
    disabled,
  } = props;
  const intl = useIntl();

  const { dayInWeek = [], startDate, endDate } = values;
  const [selectedDays, setSelectedDays] = useState<string[]>(dayInWeek);
  const dayInWeekFromStartDateToEndDate = getDayInWeekFromPeriod(
    startDate,
    endDate,
  ).map((weekDay) => convertWeekDay(weekDay));
  const disableDayInWeekOptions = differenceBy(
    DAY_IN_WEEK,
    dayInWeekFromStartDateToEndDate,
    'key',
  );
  useEffect(() => {
    form.change('dayInWeek', selectedDays);
  }, [form, selectedDays, selectedDays.length]);

  const containerClasses = classNames(css.container, containerClassName);

  const titleClasses = classNames(css.title, titleClassName);
  const fieldGroupsClasses = classNames(css.fieldGroups, fieldGroupClassName);

  return (
    <div className={containerClasses}>
      {title && <div className={titleClasses}>{title}</div>}
      <FieldTextInput
        id="dayInWeek"
        name="dayInWeek"
        type="hidden"
        disabled={disabled}
      />
      <div className={fieldGroupsClasses}>
        {DAY_IN_WEEK.map((day) => {
          const handleDaySelect = () => {
            if (disabled) return;

            if (selectedDays.includes(day.key))
              setSelectedDays(selectedDays.filter((key) => key !== day.key));
            else setSelectedDays(selectedDays.concat(day.key));
          };

          return (
            <div
              key={day.key}
              className={classNames(css.dayItem, {
                [css.selected]: selectedDays.includes(day.key),
                [css.disabled]:
                  disableDayInWeekOptions.includes(day) || disabled,
              })}
              onClick={handleDaySelect}>
              {intl.formatMessage({ id: day.label })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default DayInWeekField;
