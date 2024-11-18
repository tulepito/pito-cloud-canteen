import { useState } from 'react';
import { DateTime } from 'luxon';

import { diffDays, getNextWeek } from '@src/utils/dates';

import type { TMealDateFormValues } from '../MealDateForm/MealDateForm';

type TUseOrderDateSelect = {
  form: any;
  values: Partial<TMealDateFormValues>;
  selectedTimeRangeOption: string;
  modalCallback?: () => void;
};

export const useOrderDateSelect = ({
  form,
  values,
  selectedTimeRangeOption,
  modalCallback,
}: TUseOrderDateSelect) => {
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

  const minDate =
    selectedTimeRangeOption === 'custom'
      ? DateTime.now()
          .plus({ hours: +process.env.NEXT_PUBLIC_ORDER_MINIMUM_TIME })
          .toJSDate()
      : startDate;

  const maxDate =
    selectedTimeRangeOption !== 'custom'
      ? endDate
      : selectedTimeRangeOption === 'custom' && !!startDate && !endDate
      ? DateTime.fromJSDate(startDate!).plus({ days: 6 }).toJSDate()
      : undefined;

  const handleTimeRangeSelect = (key: string) => {
    switch (key) {
      case 'next7Days':
        setStartDate(
          DateTime.now()
            .plus({ hours: +process.env.NEXT_PUBLIC_ORDER_MINIMUM_TIME })
            .toJSDate(),
        );
        setEndDate(
          DateTime.now()
            .plus({ hours: +process.env.NEXT_PUBLIC_ORDER_MINIMUM_TIME })
            .plus({ days: 6 })
            .toJSDate(),
        );
        break;

      case 'nextWeek':
        setStartDate(getNextWeek(new Date()));
        setEndDate(
          DateTime.fromJSDate(getNextWeek(new Date()))
            .plus({ days: 6 })
            .startOf('day')
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
    modalCallback?.();
  };

  const handleOrderDateRangeChange = (_values: [Date | null, Date | null]) => {
    setStartDate(_values[0]);
    if (
      _values[1] &&
      diffDays(_values[1].getTime(), _values[0]?.getTime()).days > 6
    ) {
      setEndDate(DateTime.fromJSDate(_values[0]!).plus({ days: 6 }).toJSDate());
    } else {
      setEndDate(_values[1]);
    }
  };

  return {
    startDate,
    endDate,
    minDate,
    maxDate,
    setStartDate,
    setEndDate,
    handleUpdateDateRange,
    handleOrderDateRangeChange,
    handleTimeRangeSelect,
  };
};
