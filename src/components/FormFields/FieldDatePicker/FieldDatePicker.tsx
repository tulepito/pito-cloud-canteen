import 'react-datepicker/dist/react-datepicker.css';

import ValidationError from '@components/ValidationError/ValidationError';
import classNames from 'classnames';
import viLocale from 'date-fns/locale/vi';
import DatePicker, { registerLocale } from 'react-datepicker';
import type { FieldProps, FieldRenderProps } from 'react-final-form';
import { Field } from 'react-final-form';

import css from './FieldDatePicker.module.scss';

registerLocale('vi', viLocale);
type FieldDatePickerProps = FieldRenderProps<string, any> & {
  label?: string;
  name?: string;
};

const FieldDatePickerComponent: React.FC<FieldDatePickerProps> = (props) => {
  const {
    className,
    label,
    input,
    id,
    meta,
    customErrorText,
    onChange: onDatePickerChange,
    ...rest
  } = props;
  const { name, onChange } = input;
  const onInputChange = (date: Date, event: any) => {
    if (typeof onDatePickerChange === 'function') {
      onDatePickerChange(date, event);
      onChange(date.getTime());
    }
  };
  const { invalid, touched, error } = meta;
  const errorText = customErrorText || error;
  const hasError = !!customErrorText || !!(touched && invalid && error);
  const fieldMeta = { touched: hasError, error: errorText };
  const labelClasses = classNames(css.labelRoot);
  const labelRequiredRedStar = fieldMeta.error ? css.labelRequiredRedStar : '';
  return (
    <div className={className}>
      {label && (
        <label className={labelClasses} htmlFor={id}>
          {label}
          {fieldMeta.error && <span className={labelRequiredRedStar}>*</span>}
        </label>
      )}
      <DatePicker
        locale="vi"
        id={id}
        name={name}
        onChange={onInputChange}
        {...rest}
      />
      <ValidationError fieldMeta={fieldMeta} />
    </div>
  );
};

const FieldDatePicker: React.FC<FieldProps<string, any>> = (props) => {
  return <Field component={FieldDatePickerComponent} {...props} />;
};

export default FieldDatePicker;
