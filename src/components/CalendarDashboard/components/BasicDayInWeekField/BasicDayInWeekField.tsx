import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import { DAY_IN_WEEK } from '@src/utils/constants';

import css from './BasicDayInWeekField.module.scss';

type TBasicDayInWeekFieldProps = {
  form: any;
  values: any;
  title?: string;
  containerClassName?: string;
  disabledDates?: string[];
};

const BasicDayInWeekField: React.FC<TBasicDayInWeekFieldProps> = (props) => {
  const { form, title, containerClassName, values, disabledDates = [] } = props;
  const intl = useIntl();
  const { selectedDays: intitialSelectedDays } = values || {};
  const [selectedDays, setSelectedDays] = useState<string[]>(
    intitialSelectedDays || [],
  );

  useEffect(() => {
    form.change('selectedDays', selectedDays);
  }, [form, selectedDays, selectedDays.length]);

  const containerClasses = classNames(css.container, containerClassName);

  return (
    <div className={containerClasses}>
      {title && <div className={css.title}>{title}</div>}
      <input id="selectedDays" name="selectedDays" type="hidden" />
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
                [css.disabled]: disabledDates.includes(day.key),
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
export default BasicDayInWeekField;
