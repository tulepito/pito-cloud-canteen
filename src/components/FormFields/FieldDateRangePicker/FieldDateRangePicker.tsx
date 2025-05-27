import type { ReactDatePickerCustomHeaderProps } from 'react-datepicker';
import DatePicker from 'react-datepicker';
import type { FieldProps, FieldRenderProps } from 'react-final-form';
import { Field } from 'react-final-form';
import classNames from 'classnames';

import IconArrow from '@components/Icons/IconArrow/IconArrow';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import ValidationError from '@components/ValidationError/ValidationError';
import { useLocaleTimeProvider } from '@src/translations/TranslationProvider';
import { formatDate } from '@src/utils/dates';

import 'react-datepicker/dist/react-datepicker.css';
import css from './FieldDateRangePicker.module.scss';

type FieldDateRangePickerProps = FieldRenderProps<
  {
    startDate: Date | null;
    endDate: Date | null;
  },
  any
> & {
  label?: string;
  name?: string;
  shouldHideInput?: boolean;
  fieldWrapperClassName?: string;
};

const renderCustomHeader = (props: ReactDatePickerCustomHeaderProps) => {
  const { increaseMonth, decreaseMonth, monthDate } = props;

  return (
    <div className={css.calendarHear}>
      <IconArrow
        onClick={decreaseMonth}
        direction="left"
        className={css.arrow}
      />
      <div className={css.date}>
        {formatDate(new Date(monthDate), 'MMMM, yyyy')}
      </div>
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

const FieldDateRangePickerComponent: React.FC<FieldDateRangePickerProps> = (
  props,
) => {
  const {
    id,
    className,
    input,
    label,
    customInput,
    meta,
    customErrorText,
    inputRootClassName,
    inputClassName,
    selected,
    startDate: startDateProps,
    endDate: endDateProps,
    shouldHideInput = false,
    fieldWrapperClassName,
    ...rest
  } = props;
  const { name, onChange, value, onBlur } = input;

  const startDate = startDateProps || value.startDate;
  const endDate = endDateProps || value.endDate;
  const formatWeekDay = (dayOfWeek: string) => {
    return EDaysOfWeekInEn[dayOfWeek as keyof typeof EDaysOfWeekInEn];
  };

  const { invalid, error, touched } = meta;
  const errorText = customErrorText || error;
  const hasError = !!customErrorText || !!(touched && invalid && error);

  const localeTimeProvider = useLocaleTimeProvider();

  const fieldMeta = {
    shouldSkipTouched: true,
    touched: hasError,
    error: errorText,
  };

  const labelClasses = classNames(css.labelRoot);
  const labelRequiredRedStar = fieldMeta.error ? css.labelRequiredRedStar : '';

  const inputClasses =
    inputRootClassName ||
    classNames(css.input, inputClassName, {
      [css.inputError]: !!customErrorText || !!(invalid && error),
    });

  const fieldWrapperClasses = classNames(
    css.fieldsWrapper,
    fieldWrapperClassName,
  );

  const onInputChange = (dates: [Date | null, Date | null]) => {
    const [startDateValue, endDateValue] = dates;
    onChange({
      startDateValue,
      endDateValue,
    });
    onBlur();
  };

  return (
    <div className={classNames(css.root, className)}>
      {label && (
        <label className={labelClasses} htmlFor={id}>
          {label}
          {fieldMeta.error && <span className={labelRequiredRedStar}>*</span>}
        </label>
      )}
      <RenderWhen condition={!shouldHideInput}>
        <>
          <div className={fieldWrapperClasses}>
            <div className={inputClasses}>
              {startDate && formatDate(new Date(startDate), 'dd/MM/yyyy')}
            </div>
            <div className={inputClasses}>
              {endDate && formatDate(new Date(endDate), 'dd/MM/yyyy')}
            </div>
          </div>
        </>
      </RenderWhen>
      <DatePicker
        locale={localeTimeProvider}
        id={id}
        name={name}
        onChange={onInputChange}
        customInput={customInput}
        renderCustomHeader={renderCustomHeader}
        selected={value.startDate || selected}
        startDate={startDate}
        endDate={endDate}
        formatWeekDay={formatWeekDay}
        calendarStartDay={0}
        selectsRange
        inline
        {...rest}
      />
      {!customInput && <ValidationError fieldMeta={fieldMeta} />}
    </div>
  );
};

const FieldDateRangePicker: React.FC<FieldProps<string, any>> = (props) => {
  return <Field component={FieldDateRangePickerComponent} {...props} />;
};

export default FieldDateRangePicker;
