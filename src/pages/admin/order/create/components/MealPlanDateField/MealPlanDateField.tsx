import FieldDatePicker from '@components/FormFields/FieldDatePicker/FieldDatePicker';
import FieldSelect from '@components/FormFields/FieldSelect/FieldSelect';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconCalendar from '@components/Icons/IconCalender/IconCalender';
import IconClock from '@components/Icons/IconClock/IconClock';
import { generateTimeOptions } from '@utils/dates';
import { composeValidators, nonSatOrSunDay, required } from '@utils/validators';
import classNames from 'classnames';
import addDays from 'date-fns/addDays';
import format from 'date-fns/format';
import viLocale from 'date-fns/locale/vi';
import { useState } from 'react';
import { OnChange } from 'react-final-form-listeners';
import { useIntl } from 'react-intl';

import css from './MealPlanDateField.module.scss';

const TIME_OPTIONS = generateTimeOptions();

type MealPlanDateFieldProps = {
  form: any;
  values: Record<string, any>;
  columnLayout?: boolean;
  title?: string;
};

const MealPlanDateField: React.FC<MealPlanDateFieldProps> = (props) => {
  const { values, columnLayout = false, form, title } = props;
  const { startDate: startDateInitialValue, endDate: endDateInitialValue } =
    values;
  const intl = useIntl();
  const initialStartDate = startDateInitialValue
    ? new Date(startDateInitialValue)
    : null;
  const initialEndDate = endDateInitialValue
    ? new Date(endDateInitialValue)
    : null;
  const today = new Date();
  const [startDate, setStartDate] = useState<Date>(initialStartDate!);
  const [endDate, setEndDate] = useState<Date>(initialEndDate!);
  const startDateRequiredMessage = intl.formatMessage({
    id: 'MealPlanDateField.startDateRequired',
  });
  const startDateNonSatOrSunDayMessage = intl.formatMessage({
    id: 'MealPlanDateField.startDate.nonSatOrSunDay',
  });
  const endDateRequiredMessage = intl.formatMessage({
    id: 'MealPlanDateField.endDateRequired',
  });
  const deliveryHourRequiredMessage = intl.formatMessage({
    id: 'MealPlanDateField.deliveryHourRequired',
  });

  const fieldGroupLayout = classNames(css.fieldGroups, {
    [css.column]: columnLayout,
  });
  const maxEndDate = startDate ? addDays(startDate, 6) : undefined;
  const handleStartDateChange = (value: any, prevValue: any) => {
    if (endDateInitialValue && value !== prevValue) {
      form.batch(() => {
        form.change('endDate', undefined);
        setEndDate(undefined!);
      });
    }
  };
  const startDateClasses = classNames(
    css.customInput,
    !startDate && css.placeholder,
  );

  const endDateClasses = classNames(
    css.customInput,
    !endDate && css.placeholder,
  );

  return (
    <div className={css.container}>
      {title && <div className={css.fieldTitle}>{title}</div>}
      <OnChange name="startDate">{handleStartDateChange}</OnChange>
      <div className={fieldGroupLayout}>
        <FieldDatePicker
          id="startDate"
          name="startDate"
          selected={startDate}
          onChange={(date: Date) => setStartDate(date)}
          minDate={addDays(today, 3)}
          autoComplete="off"
          label={intl.formatMessage({
            id: 'MealPlanDateField.startDateLabel',
          })}
          className={startDateClasses}
          validate={composeValidators(
            required(startDateRequiredMessage),
            nonSatOrSunDay(startDateNonSatOrSunDayMessage),
          )}
          customInput={
            <FieldTextInput
              id="startDate"
              name="startDate"
              disabled
              format={(value) => {
                return value
                  ? format(new Date(value), 'EEE, dd MMMM, yyyy', {
                      locale: viLocale,
                    })
                  : intl.formatMessage({
                      id: 'MealPlanDateField.startDatePlaceholder',
                    });
              }}
              leftIcon={<IconCalendar />}
            />
          }
        />
        <FieldDatePicker
          id="endDate"
          name="endDate"
          onChange={(date: Date) => setEndDate(date)}
          selected={endDate}
          label={intl.formatMessage({ id: 'MealPlanDateField.endDateLabel' })}
          className={endDateClasses}
          minDate={startDate}
          maxDate={maxEndDate}
          dateFormat={'EEE, dd MMMM, yyyy'}
          autoComplete="off"
          validate={required(endDateRequiredMessage)}
          disabled={!startDate}
          customInput={
            <FieldTextInput
              id="endDate"
              name="endDate"
              disabled
              format={(value) => {
                return value
                  ? format(new Date(value), 'EEE, dd MMMM, yyyy', {
                      locale: viLocale,
                    })
                  : intl.formatMessage({
                      id: 'MealPlanDateField.endDatePlaceholder',
                    });
              }}
              leftIcon={<IconCalendar />}
            />
          }
        />
        <FieldSelect
          id="deliveryHour"
          name="deliveryHour"
          label={intl.formatMessage({
            id: 'MealPlanDateField.deliveryHourLabel',
          })}
          className={css.fieldSelect}
          leftIcon={<IconClock />}
          validate={required(deliveryHourRequiredMessage)}>
          {TIME_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </FieldSelect>
      </div>
    </div>
  );
};
export default MealPlanDateField;
