import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import Tooltip from '@components/Tooltip/Tooltip';
import { DAY_IN_WEEK } from '@src/utils/constants';
import type { TAvailabilityPlanEntries } from '@src/utils/types';

import css from './BasicDayInWeekField.module.scss';

type TBasicDayInWeekFieldProps = {
  form: any;
  values: any;
  title?: string;
  containerClassName?: string;
  disabledDates?: string[];
  availabilityPlanDayOfWeek?: TAvailabilityPlanEntries[];
};

const BasicDayInWeekField: React.FC<TBasicDayInWeekFieldProps> = (props) => {
  const {
    form,
    title,
    containerClassName,
    values,
    disabledDates = [],
    availabilityPlanDayOfWeek,
  } = props;
  const intl = useIntl();
  const { selectedDays: intitialSelectedDays } = values || {};
  const [selectedDays, setSelectedDays] = useState<string[]>(
    intitialSelectedDays || [],
  );

  useEffect(() => {
    form.change('selectedDays', selectedDays);
  }, [form, selectedDays, selectedDays.length]);

  const containerClasses = classNames(css.container, containerClassName);

  const dayInWeek = useMemo(() => {
    return DAY_IN_WEEK.map((day) => {
      const isAvailable = availabilityPlanDayOfWeek?.some(
        (planDay) => planDay?.dayOfWeek === day.key,
      );

      if (isAvailable) {
        const isDisabled = disabledDates.includes(day.key);

        return {
          ...day,
          disabled: isDisabled,
          content: isDisabled
            ? `Không nằm trong thời gian được chọn`
            : undefined,
        };
      }

      return {
        ...day,
        disabled: true,
        content: `Nhà hàng không hoạt động vào ${intl.formatMessage({
          id: day.label,
        })}`,
      };
    });
  }, [availabilityPlanDayOfWeek, intl, disabledDates]);

  return (
    <div className={containerClasses}>
      {title && <div className={css.title}>{title}</div>}
      <input id="selectedDays" name="selectedDays" type="hidden" />
      <div className={css.fieldGroups}>
        {dayInWeek?.map((day) => {
          const onDaySelect = () => {
            if (selectedDays.includes(day.key))
              setSelectedDays(selectedDays.filter((key) => key !== day.key));
            else setSelectedDays(selectedDays.concat(day.key));
          };

          return day.disabled ? (
            <Tooltip
              key={day.key}
              placement="top"
              overlayInnerStyle={{
                padding: '8px 12px',
                maxWidth: 150,
              }}
              tooltipContent={<div>{day.content}</div>}>
              <div
                className={classNames(css.dayItem, {
                  [css.selected]: selectedDays.includes(day.key),
                  [css.disabled]: disabledDates.includes(day.key),
                })}
                onClick={onDaySelect}>
                {intl.formatMessage({ id: day.label })}
              </div>
            </Tooltip>
          ) : (
            <div
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
