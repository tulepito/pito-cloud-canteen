import type { ReactDatePickerCustomHeaderProps } from 'react-datepicker';
import DatePicker from 'react-datepicker';
import type { FieldProps, FieldRenderProps } from 'react-final-form';
import { Field } from 'react-final-form';
import classNames from 'classnames';

import IconArrow from '@components/Icons/IconArrow/IconArrow';
import ValidationError from '@components/ValidationError/ValidationError';
import { formatDate } from '@src/utils/dates';

import 'react-datepicker/dist/react-datepicker.css';
import css from './FieldDatePicker.module.scss';

type FieldDatePickerProps = FieldRenderProps<string, any> & {
  label?: string;
  name?: string;
  shouldSkipTouched?: boolean;
  shouldHideBoxShadow?: boolean;
  icon?: React.ReactNode;
};

const renderCustomHeader = (props: ReactDatePickerCustomHeaderProps) => {
  const { date, increaseMonth, decreaseMonth } = props;

  return (
    <div className={css.calendarHear}>
      <IconArrow
        onClick={decreaseMonth}
        direction="left"
        className={css.arrow}
      />
      <div className={css.date}>{formatDate(new Date(date), 'MMMM, yyyy')}</div>
      <IconArrow
        onClick={increaseMonth}
        direction="right"
        className={css.arrow}
      />
    </div>
  );
};

enum EDaysOfWeekInEn {
  'Thứ Hai' = 'M',
  'Thứ Ba' = 'T',
  'Thứ Tư' = 'W',
  'Thứ Năm' = 'T',
  'Thứ Sáu' = 'F',
  'Thứ Bảy' = 'S',
  'Chủ Nhật' = 'S',
}

export const FieldDatePickerComponent: React.FC<FieldDatePickerProps> = (
  props,
) => {
  const {
    className,
    label,
    input,
    id,
    meta,
    customErrorText,
    onChange: onDatePickerChange,
    customInput,
    selected,
    inputRootClassName,
    inputClassName,
    readOnly = false,
    shouldSkipTouched = true,
    shouldHideBoxShadow = false,
    icon,
    ...rest
  } = props;
  const { name, onChange, value, onBlur } = input;
  const onInputChange = (date: Date, event: any) => {
    if (typeof onDatePickerChange === 'function') {
      onDatePickerChange(date, event);
    }
    onChange(date?.getTime());
    onBlur();
  };

  const classes = classNames(css.root, className, {
    [css.hideBoxShadow]: shouldHideBoxShadow,
  });

  const { invalid, error, touched } = meta;
  const errorText = customErrorText || error;
  const hasError = !!customErrorText || !!(touched && invalid && error);
  const fieldMeta = {
    shouldSkipTouched,
    touched: hasError,
    error: errorText,
  };
  const labelClasses = classNames(css.labelRoot);
  const labelRequiredRedStar = fieldMeta.error ? css.labelRequiredRedStar : '';

  const inputClasses =
    inputRootClassName ||
    classNames(css.input, inputClassName, {
      [css.inputError]: hasError,
    });

  const formatWeekDay = (dayOfWeek: string) => {
    return EDaysOfWeekInEn[dayOfWeek as keyof typeof EDaysOfWeekInEn];
  };

  const handleFocus = (e: any) => {
    e.target.readOnly = readOnly;
  };

  return (
    <div className={classes}>
      {label && (
        <label className={labelClasses} htmlFor={id}>
          {label}
          {fieldMeta.error && <span className={labelRequiredRedStar}>*</span>}
        </label>
      )}
      <div className={css.fieldWrapper}>
        <DatePicker
          id={id}
          name={name}
          onChange={onInputChange}
          onFocus={handleFocus}
          className={inputClasses}
          customInput={customInput}
          renderCustomHeader={renderCustomHeader}
          selected={value || selected}
          formatWeekDay={formatWeekDay}
          calendarStartDay={0}
          {...rest}
        />
        {icon && <div className={css.icon}>{icon}</div>}
      </div>
      {!customInput && <ValidationError fieldMeta={fieldMeta} />}
    </div>
  );
};

const FieldDatePicker: React.FC<FieldProps<string, any>> = (props) => {
  return <Field component={FieldDatePickerComponent} {...props} />;
};

export default FieldDatePicker;
