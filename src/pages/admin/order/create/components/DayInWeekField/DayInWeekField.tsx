import FieldTextInput from '@components/FieldTextInput/FieldTextInput';
import classNames from 'classnames';
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
  values: Record<string, any>;
};
const DayInWeekField: React.FC<DayInWeekFieldProps> = (props) => {
  const { form, values } = props;
  const intl = useIntl();
  const { dayInWeek = [] } = values;
  const [selectedDays, setSelectedDays] = useState<string[]>(dayInWeek);
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
