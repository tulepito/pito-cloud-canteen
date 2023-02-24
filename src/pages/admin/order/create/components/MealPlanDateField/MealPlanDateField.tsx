import FieldDatePicker from '@components/FormFields/FieldDatePicker/FieldDatePicker';
import FieldSelect from '@components/FormFields/FieldSelect/FieldSelect';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconCalendar from '@components/Icons/IconCalender/IconCalender';
import IconClock from '@components/Icons/IconClock/IconClock';
import { findMinStartDate } from '@helpers/orderHelper';
import { generateTimeOptions } from '@utils/dates';
import { composeValidators, nonSatOrSunDay, required } from '@utils/validators';
import classNames from 'classnames';
import addDays from 'date-fns/addDays';
import format from 'date-fns/format';
import viLocale from 'date-fns/locale/vi';
import { forwardRef, useState } from 'react';
import { OnChange } from 'react-final-form-listeners';
import { useIntl } from 'react-intl';

import css from './MealPlanDateField.module.scss';

const TIME_OPTIONS = generateTimeOptions();

type MealPlanDateFieldProps = {
  form: any;
  values: Record<string, any>;
  columnLayout?: boolean;
  title?: string;
  layoutClassName?: string;
  containerClassName?: string;
  onCustomStartDateChange?: (date: number) => void;
};

// eslint-disable-next-line react/display-name
const CustomStartDateFieldInput = forwardRef((props, ref) => {
  return (
    <FieldTextInput
      {...props}
      id="startDate"
      name="startDate"
      className={css.customInput}
      format={(value) => {
        return value
          ? format(new Date(value), 'EEE, dd MMMM, yyyy', {
              locale: viLocale,
            })
          : format(new Date(), 'EEE, dd MMMM, yyyy', {
              locale: viLocale,
            });
      }}
      leftIcon={<IconCalendar />}
      inputRef={ref}
    />
  );
});

// eslint-disable-next-line react/display-name
const CustomEndDateFieldInput = forwardRef((props, ref) => {
  return (
    <FieldTextInput
      {...props}
      id="endDate"
      name="endDate"
      className={css.customInput}
      format={(value) => {
        return value
          ? format(new Date(value), 'EEE, dd MMMM, yyyy', {
              locale: viLocale,
            })
          : format(new Date(), 'EEE, dd MMMM, yyyy', {
              locale: viLocale,
            });
      }}
      leftIcon={<IconCalendar />}
      inputRef={ref}
    />
  );
});

const MealPlanDateField: React.FC<MealPlanDateFieldProps> = (props) => {
  const {
    values,
    columnLayout = false,
    form,
    title,
    onCustomStartDateChange,
    layoutClassName,
    containerClassName,
  } = props;
  const { startDate: startDateInitialValue, endDate: endDateInitialValue } =
    values;
  const intl = useIntl();
  const initialStartDate = startDateInitialValue
    ? new Date(startDateInitialValue)
    : null;
  const initialEndDate = endDateInitialValue
    ? new Date(endDateInitialValue)
    : null;
  const [startDate, setStartDate] = useState<Date>(initialStartDate!);
  const [endDate, setEndDate] = useState<Date>(initialEndDate!);

  const minStartDate = findMinStartDate();

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

  const fieldGroupLayout = classNames(
    css.fieldGroups,
    {
      [css.column]: columnLayout,
    },
    layoutClassName,
  );
  const maxEndDate = startDate ? addDays(startDate, 6) : undefined;
  const handleStartDateChange = (value: any, prevValue: any) => {
    if (endDateInitialValue && value !== prevValue) {
      form.batch(() => {
        form.change('endDate', undefined);
        setEndDate(undefined!);
      });
    }
    if (typeof onCustomStartDateChange === 'function') {
      onCustomStartDateChange(value);
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

  const containerClasses = classNames(css.container, containerClassName);
  return (
    <div className={containerClasses}>
      {title && <div className={css.fieldTitle}>{title}</div>}
      <OnChange name="startDate">{handleStartDateChange}</OnChange>
      <div className={fieldGroupLayout}>
        <FieldDatePicker
          id="startDate"
          name="startDate"
          selected={startDate}
          onChange={(date: Date) => setStartDate(date)}
          minDate={minStartDate}
          autoComplete="off"
          label={intl.formatMessage({
            id: 'MealPlanDateField.startDateLabel',
          })}
          dateFormat={'EEE, dd MMMM, yyyy'}
          className={startDateClasses}
          placeholderText={format(new Date(), 'EEE, dd MMMM, yyyy', {
            locale: viLocale,
          })}
          validate={composeValidators(
            required(startDateRequiredMessage),
            nonSatOrSunDay(startDateNonSatOrSunDayMessage),
          )}
          customInput={<CustomStartDateFieldInput />}
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
          placeholderText={format(new Date(), 'EEE, dd MMMM, yyyy', {
            locale: viLocale,
          })}
          customInput={<CustomEndDateFieldInput />}
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
