import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import { convertWeekDay, getDayInWeekFromPeriod } from '@utils/dates';
import type { TObject } from '@utils/types';
import classNames from 'classnames';
import differenceBy from 'lodash/differenceBy';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

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

type DayInWeekFieldProps = {
  form: any;
  values: TObject;
};
const DayInWeekField: React.FC<DayInWeekFieldProps> = (props) => {
  const { form, values } = props;
  const intl = useIntl();
  const { dayInWeek = [], startDate, endDate } = values;
  const [selectedDays, setSelectedDays] = useState<string[]>(dayInWeek);
  const dayInWeekFromStartDateToEndDate = getDayInWeekFromPeriod(
    parseInt(startDate, 10),
    parseInt(endDate, 10),
  ).map((weekDay) => convertWeekDay(weekDay));
  const disableDayInWeekOptions = differenceBy(
    DAY_IN_WEEK,
    dayInWeekFromStartDateToEndDate,
    'key',
  );
  useEffect(() => {
    form.change('dayInWeek', selectedDays);
  }, [form, selectedDays, selectedDays.length]);
  return (
    <div className={css.container}>
      <div className={css.fieldLabel}>
        {intl.formatMessage({ id: 'DayInWeekField.label' })}
      </div>
      <FieldTextInput id="dayInWeek" name="dayInWeek" type="hidden" />
      <div className={css.fieldGroups}>
        {DAY_IN_WEEK.map((day) => {
          const onDaySelect = () => {
            if (selectedDays.includes(day.key))
              setSelectedDays(selectedDays.filter((key) => key !== day.key));
            else setSelectedDays(selectedDays.concat(day.key));
          };
          return (
            <div
              key={day.key}
              className={classNames(css.dayItem, {
                [css.selected]: selectedDays.includes(day.key),
                [css.disabled]: disableDayInWeekOptions.includes(day),
              })}
              onClick={onDaySelect}>
              {intl.formatMessage({ id: day.label })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default DayInWeekField;
