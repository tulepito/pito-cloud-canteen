import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import useBoolean from '@hooks/useBoolean';

import css from './MenuDayInWeekField.module.scss';

type TMenuDayInWeekFieldProps = {
  form: any;
};

const DAY_IN_WEEK = [
  { key: 'mon', label: 'DayInWeekField.mon' },
  { key: 'tue', label: 'DayInWeekField.tue' },
  { key: 'wed', label: 'DayInWeekField.wed' },
  { key: 'thu', label: 'DayInWeekField.thu' },
  { key: 'fri', label: 'DayInWeekField.fri' },
  { key: 'sat', label: 'DayInWeekField.sat' },
  { key: 'sun', label: 'DayInWeekField.sun' },
];

const MenuDayInWeekField: React.FC<TMenuDayInWeekFieldProps> = ({ form }) => {
  const intl = useIntl();
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const selectFullWeekController = useBoolean();

  useEffect(() => {
    if (selectFullWeekController.value) {
      setSelectedDays(DAY_IN_WEEK.map((day) => day.key));
    } else {
      setSelectedDays([]);
    }
  }, [selectFullWeekController.value]);

  useEffect(() => {
    form.change('selectedDays', selectedDays);
  }, [form, selectedDays, selectedDays.length]);

  return (
    <div className={css.root}>
      <FieldTextInput id="selectedDays" name="selectedDays" type="hidden" />
      <div
        className={classNames(css.dayItem, {
          [css.selected]: selectFullWeekController.value,
        })}
        onClick={selectFullWeekController.toggle}>
        Cả tuần
      </div>
      <div className={css.fieldGroup}>
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
                [css.disabled]: selectFullWeekController.value,
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

export default MenuDayInWeekField;
