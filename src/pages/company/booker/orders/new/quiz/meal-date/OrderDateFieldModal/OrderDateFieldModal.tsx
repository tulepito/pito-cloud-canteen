import { useState } from 'react';
import classNames from 'classnames';
import { DateTime } from 'luxon';

import Button from '@components/Button/Button';
import FieldDateRangePicker from '@components/FormFields/FieldDateRangePicker/FieldDateRangePicker';
import { diffDays, getNextWeek } from '@src/utils/dates';

import type { TMealDateFormValues } from '../MealDateForm/MealDateForm';

import css from './OrderDateFieldModal.module.scss';

type TOrderDateFieldModalProps = {
  form: any;
  values: Partial<TMealDateFormValues>;
  onClose: () => void;
};

const timeRangeOptions = [
  {
    key: 'next7Days',
    label: '7 ngày tiếp theo',
  },
  {
    key: 'nextWeek',
    label: 'Tuần tiếp theo',
  },
  {
    key: 'custom',
    label: 'Tùy chỉnh',
  },
];

const OrderDateFieldModal: React.FC<TOrderDateFieldModalProps> = (props) => {
  const { form, values, onClose } = props;
  const { startDate: startDateInitialValue, endDate: endDateInitialValue } =
    values;
  const initialStartDate = startDateInitialValue
    ? new Date(startDateInitialValue)
    : null;
  const initialEndDate = endDateInitialValue
    ? new Date(endDateInitialValue)
    : null;
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate!);
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate!);
  const [selectedTimeRangeOption, setSelectedTimeRangeOption] =
    useState<string>('custom');

  const handleTimeRangeSelect = (key: string) => {
    switch (key) {
      case 'next7Days':
        setStartDate(new Date());
        setEndDate(DateTime.now().plus({ days: 6 }).toJSDate());
        break;

      case 'nextWeek':
        setStartDate(getNextWeek(new Date()));
        setEndDate(
          DateTime.fromJSDate(getNextWeek(new Date()))
            .plus({ days: 6 })
            .toJSDate(),
        );
        break;

      case 'custom':
        setStartDate(null);
        setEndDate(null);
        break;

      default:
        break;
    }
  };

  const handleUpdateDateRange = () => {
    form.batch(() => {
      form.change('startDate', startDate);
      form.change('endDate', endDate);
    });
    onClose();
  };

  return (
    <div className={css.container}>
      <div className={css.leftSide}>
        {timeRangeOptions.map(({ key, label }) => {
          const handleTimeRangeClick = () => {
            setSelectedTimeRangeOption(key);
            handleTimeRangeSelect(key);
          };

          return (
            <div
              key={key}
              onClick={handleTimeRangeClick}
              className={classNames(css.option, {
                [css.selected]: selectedTimeRangeOption === key,
              })}>
              {label}
            </div>
          );
        })}
      </div>
      <div className={css.rightSide}>
        <FieldDateRangePicker
          id="dateRangeField"
          name="dateRangeField"
          selected={startDate}
          onChange={(_values: [Date | null, Date | null]) => {
            setStartDate(_values[0]);
            if (
              _values[1] &&
              diffDays(_values[1].getTime(), _values[0]?.getTime()).days > 6
            ) {
              setEndDate(
                DateTime.fromJSDate(_values[0]!).plus({ days: 6 }).toJSDate(),
              );
            } else {
              setEndDate(_values[1]);
            }
          }}
          startDate={startDate}
          endDate={endDate}
          shouldHideInput
          monthsShown={2}
          minDate={new Date()}
        />
        <div className={css.bottomBtns}>
          <Button variant="inline" type="button" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            type="button"
            disabled={!startDate || !endDate}
            onClick={handleUpdateDateRange}>
            Áp dụng
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderDateFieldModal;
