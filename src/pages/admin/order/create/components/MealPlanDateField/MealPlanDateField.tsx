import FieldDatePicker from '@components/FormFields/FieldDatePicker/FieldDatePicker';
import FieldSelect from '@components/FormFields/FieldSelect/FieldSelect';
import type { TObject } from '@utils/types';
import { required } from '@utils/validators';
import classNames from 'classnames';
import addDays from 'date-fns/addDays';
import { useState } from 'react';
import { OnChange } from 'react-final-form-listeners';
import { useIntl } from 'react-intl';

import css from './MealPlanDateField.module.scss';

const TIME_OPTIONS = [
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
];

type MealPlanDateFieldProps = {
  form: any;
  values: TObject;
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
          className={css.customInput}
          label={intl.formatMessage({ id: 'MealPlanDateField.startDateLabel' })}
          minDate={addDays(today, 2)}
          dateFormat={'EEE, dd MMMM, yyyy'}
          placeholderText={intl.formatMessage({
            id: 'MealPlanDateField.startDatePlaceholder',
          })}
          autoComplete="off"
          validate={required(startDateRequiredMessage)}
        />
        <FieldDatePicker
          id="endDate"
          name="endDate"
          onChange={(date: Date) => setEndDate(date)}
          selected={endDate}
          label={intl.formatMessage({ id: 'MealPlanDateField.endDateLabel' })}
          className={css.customInput}
          minDate={startDate}
          maxDate={maxEndDate}
          dateFormat={'EEE, dd MMMM, yyyy'}
          placeholderText={intl.formatMessage({
            id: 'MealPlanDateField.endDatePlaceholder',
          })}
          autoComplete="off"
          validate={required(endDateRequiredMessage)}
          disabled={!startDate}
        />
        <FieldSelect
          id="deliveryHour"
          name="deliveryHour"
          label={intl.formatMessage({
            id: 'MealPlanDateField.deliveryHourLabel',
          })}
          className={css.fieldSelect}
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
