import { useMemo, useState } from 'react';
import { OnChange } from 'react-final-form-listeners';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import addDays from 'date-fns/addDays';
import format from 'date-fns/format';
import viLocale from 'date-fns/locale/vi';

import FieldDatePicker from '@components/FormFields/FieldDatePicker/FieldDatePicker';
import FieldDropdownSelect from '@components/FormFields/FieldDropdownSelect/FieldDropdownSelect';
import IconCalendar from '@components/Icons/IconCalender/IconCalender';
import IconClock from '@components/Icons/IconClock/IconClock';
import { findMinStartDate } from '@helpers/order/prepareDataHelper';
import { useAppSelector } from '@hooks/reduxHooks';
import { EUserSystemPermission } from '@src/utils/enums';
import { generateTimeRangeItems } from '@utils/dates';
import type { TObject } from '@utils/types';
import { composeValidators, nonSatOrSunDay, required } from '@utils/validators';

import css from './MealPlanDateField.module.scss';

const TIME_OPTIONS = generateTimeRangeItems({});

type MealPlanDateFieldProps = {
  form: any;
  values: TObject;
  columnLayout?: boolean;
  title?: string;
  layoutClassName?: string;
  containerClassName?: string;
  onCustomStartDateChange?: (date: number) => void;
  disabled?: boolean;
  isEditInProgressOrder?: boolean;
};

const MealPlanDateField: React.FC<MealPlanDateFieldProps> = (props) => {
  const {
    values,
    columnLayout = false,
    form,
    title,
    onCustomStartDateChange,
    layoutClassName,
    containerClassName,
    disabled = false,
    isEditInProgressOrder,
  } = props;
  const intl = useIntl();
  const userPermission = useAppSelector((state) => state.user.userPermission);

  const idAdminFlow = EUserSystemPermission.admin === userPermission;
  const { startDate: startDateInitialValue, endDate: endDateInitialValue } =
    values;

  const initialStartDate = startDateInitialValue
    ? new Date(startDateInitialValue)
    : null;
  const initialEndDate = endDateInitialValue
    ? new Date(endDateInitialValue)
    : null;
  const [startDate, setStartDate] = useState<Date>(initialStartDate!);
  const [endDate, setEndDate] = useState<Date>(initialEndDate!);

  const minStartDate = idAdminFlow ? new Date() : findMinStartDate();

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

  const parsedDeliveryHourOptions = useMemo(
    () =>
      TIME_OPTIONS.map((option) => ({
        label: option.label,
        key: option.key,
      })),
    [],
  );

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
          disabled={disabled}
          validate={
            idAdminFlow
              ? required(startDateRequiredMessage)
              : composeValidators(
                  required(startDateRequiredMessage),
                  nonSatOrSunDay(startDateNonSatOrSunDayMessage),
                )
          }
          shouldSkipTouched={false}
          icon={<IconCalendar />}
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
          disabled={disabled || !startDate}
          placeholderText={format(new Date(), 'EEE, dd MMMM, yyyy', {
            locale: viLocale,
          })}
          shouldSkipTouched={false}
          icon={<IconCalendar />}
        />
        <FieldDropdownSelect
          id="deliveryHour"
          name="deliveryHour"
          label={intl.formatMessage({
            id: 'MealPlanDateField.deliveryHourLabel',
          })}
          className={css.fieldSelect}
          leftIcon={<IconClock />}
          validate={required(deliveryHourRequiredMessage)}
          placeholder={intl.formatMessage({
            id: 'OrderDeadlineField.deliveryHour.placeholder',
          })}
          disabled={isEditInProgressOrder ? !disabled : disabled}
          options={parsedDeliveryHourOptions}
        />
      </div>
    </div>
  );
};
export default MealPlanDateField;
