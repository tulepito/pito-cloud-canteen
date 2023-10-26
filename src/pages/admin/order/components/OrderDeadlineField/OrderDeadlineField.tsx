/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react-hooks/exhaustive-deps */
import { forwardRef, useEffect, useMemo, useState } from 'react';
import { OnChange } from 'react-final-form-listeners';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import format from 'date-fns/format';
import viLocale from 'date-fns/locale/vi';
import { DateTime } from 'luxon';

import FieldDatePicker from '@components/FormFields/FieldDatePicker/FieldDatePicker';
import FieldDropdownSelect from '@components/FormFields/FieldDropdownSelect/FieldDropdownSelect';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconCalendar from '@components/Icons/IconCalender/IconCalender';
import IconClock from '@components/Icons/IconClock/IconClock';
import Tooltip from '@components/Tooltip/Tooltip';
import { convertHHmmStringToTimeParts } from '@helpers/dateHelpers';
import { findValidRangeForDeadlineDate } from '@helpers/orderHelper';
import { useAppSelector } from '@hooks/reduxHooks';
import { EUserSystemPermission } from '@src/utils/enums';
import { renderListTimeOptions, TimeOptions } from '@utils/dates';
import type { TObject } from '@utils/types';
import { required } from '@utils/validators';

import css from './OrderDeadlineField.module.scss';

type TOrderDeadlineFieldProps = {
  form: any;
  values: TObject;
  columnLayout?: boolean;
  title?: string;
  containerClassName?: string;
  layoutClassName?: string;
  deadlineDateLabel?: string;
  deadlineHourLabel?: string;
  isEditFlow?: boolean;
};

// eslint-disable-next-line react/display-name
const CustomDeadlineFieldInput = forwardRef((props, ref) => {
  return (
    <FieldTextInput
      {...props}
      id="deadlineDate"
      name="deadlineDate"
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
      leftIcon={
        <Tooltip
          overlayClassName={css.tooltipOverlay}
          tooltipContent={<span>Hạn dành cho người tham gia chọn món</span>}
          placement="bottomLeft">
          <div className={css.iconWrapper}>
            <IconCalendar />
          </div>
        </Tooltip>
      }
      inputRef={ref}
    />
  );
});

const OrderDeadlineField: React.FC<TOrderDeadlineFieldProps> = (props) => {
  const {
    values,
    columnLayout,
    title,
    form,
    containerClassName,
    layoutClassName,
    deadlineDateLabel,
    deadlineHourLabel,
    isEditFlow,
  } = props;
  const intl = useIntl();

  const {
    deadlineDate: deadlineDateInitialValue,
    startDate: startDateInitialValue,
    deliveryHour,
  } = values;
  const userPermission = useAppSelector((state) => state.user.userPermission);

  const isAdminFlow = EUserSystemPermission.admin === userPermission;

  const { minSelectedDate, maxSelectedDate } = isAdminFlow
    ? { minSelectedDate: new Date(), maxSelectedDate: startDateInitialValue }
    : findValidRangeForDeadlineDate(startDateInitialValue);

  const initialDeadlineDate = deadlineDateInitialValue
    ? new Date(deadlineDateInitialValue)
    : null;
  const [deadlineDate, setDeadlineDate] = useState<Date>(initialDeadlineDate!);
  const deadlineDateRequired = intl.formatMessage({
    id: 'OrderDeadlineField.deadlineDateRequired',
  });
  const deadlineHourRequired = intl.formatMessage({
    id: 'OrderDeadlineField.deadlineHourRequired',
  });

  const fieldGroupLayout = classNames(
    css.fieldGroups,
    {
      [css.column]: columnLayout,
    },
    layoutClassName,
  );
  const handleStartDateChange = (value: any, prevValue: any) => {
    if (deadlineDateInitialValue && value !== prevValue) {
      form.batch(() => {
        form.change('deadlineDate', undefined);
        setDeadlineDate(undefined!);
      });
    }
  };

  const containerClasses = classNames(css.container, containerClassName);

  const deadlineDateClasses = classNames(
    css.customInput,
    !deadlineDate && css.placeholder,
  );

  const isDeliveryDateSameWithStartDate =
    values.deadlineDate !== null &&
    startDateInitialValue !== null &&
    DateTime.fromMillis(values.deadlineDate || 0)
      .startOf('day')
      .toMillis() ===
      DateTime.fromMillis(startDateInitialValue || 0)
        .startOf('day')
        .toMillis();

  const parsedDeliveryHourOptions = useMemo(() => {
    return (
      isAdminFlow && isDeliveryDateSameWithStartDate
        ? renderListTimeOptions({
            endTime: deliveryHour.split('-')[0],
          })
        : TimeOptions
    ).map((option) => ({
      label: option.label,
      key: option.key,
    }));
  }, [deliveryHour, isDeliveryDateSameWithStartDate, isAdminFlow]);

  useEffect(() => {
    const { hours: deadlineHour, minutes: deadlineMinute } =
      convertHHmmStringToTimeParts(
        values.deadlineHour === null ? undefined : values.deadlineHour,
      );
    const { hours: deliveryHour, minutes: deliveryMinute } =
      convertHHmmStringToTimeParts(
        values.deliveryHour === null ? undefined : values.deliveryHour,
      );
    const deadlineInterval = 60 * deadlineHour + deadlineMinute;
    const deliveryInterval = 60 * deliveryHour + deliveryMinute;

    if (
      isDeliveryDateSameWithStartDate &&
      deadlineInterval > deliveryInterval &&
      isAdminFlow
    ) {
      form.change('deadlineHour', null);
    }
  }, [values.deliveryHour, isDeliveryDateSameWithStartDate]);

  return (
    <div className={containerClasses}>
      {title && <div className={css.fieldTitle}>{title}</div>}
      <OnChange name="startDate">{handleStartDateChange}</OnChange>
      <div className={fieldGroupLayout}>
        <FieldDatePicker
          id="deadlineDate"
          name="deadlineDate"
          selected={deadlineDate}
          onChange={(date: Date) => setDeadlineDate(date)}
          className={deadlineDateClasses}
          label={
            deadlineDateLabel ||
            intl.formatMessage({
              id: 'OrderDeadlineField.deadlineDateLabel',
            })
          }
          autoComplete="off"
          minDate={minSelectedDate}
          maxDate={maxSelectedDate}
          dateFormat={'EEE, dd MMMM, yyyy'}
          validate={required(deadlineDateRequired)}
          customInput={<CustomDeadlineFieldInput />}
          disabled={isEditFlow}
        />
        <FieldDropdownSelect
          id="deadlineHour"
          name="deadlineHour"
          label={
            deadlineHourLabel ||
            intl.formatMessage({
              id: 'OrderDeadlineField.deliveryHourLabel',
            })
          }
          className={css.fieldSelect}
          leftIcon={<IconClock />}
          validate={required(deadlineHourRequired)}
          options={parsedDeliveryHourOptions}
          placeholder={intl.formatMessage({
            id: 'OrderDeadlineField.deadlineHour.placeholder',
          })}
          disabled={isEditFlow}
        />
      </div>
    </div>
  );
};
export default OrderDeadlineField;
