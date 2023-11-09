import { useState } from 'react';
import { DateTime } from 'luxon';

import { getDayBeforeGivenDayWithOffset, getYesterday } from '@src/utils/dates';

export const timePeriodOptions = [
  {
    key: 'today',
    label: 'Hôm nay',
  },
  {
    key: 'yesterday',
    label: 'Hôm qua',
  },
  {
    key: 'lastWeek',
    label: 'Tuần trước',
  },
  {
    key: 'lastMonth',
    label: 'Tháng trước',
  },
  {
    key: 'last7Days',
    label: '7 ngày trước',
  },
  {
    key: 'last30Days',
    label: '30 ngày trước',
  },
];

export const useControlTimeRange = () => {
  const today = new Date();
  const yesterday = getYesterday();
  const before7DaysAgo = getDayBeforeGivenDayWithOffset(yesterday, 6);
  const [startDate, setStartDate] = useState<Date | null>(before7DaysAgo);
  const [endDate, setEndDate] = useState<Date | null>(yesterday);
  const [timePeriodOption, setTimePeriodOption] = useState<string>('custom');

  const handleTimePeriodChange = (value: string) => {
    setTimePeriodOption(value);
    switch (value) {
      case 'today':
        setStartDate(today);
        setEndDate(today);
        break;
      case 'yesterday':
        setStartDate(yesterday);
        setEndDate(yesterday);
        break;
      case 'lastWeek':
        {
          const startOfLastWeek = DateTime.now()
            .minus({ weeks: 1 })
            .startOf('week')
            .toJSDate();

          const endOfLastWeek = DateTime.now()
            .minus({ weeks: 1 })
            .endOf('week')
            .toJSDate();
          setStartDate(startOfLastWeek);
          setEndDate(endOfLastWeek);
        }
        break;
      case 'lastMonth':
        {
          const startOfLastMonth = DateTime.now()
            .minus({ months: 1 })
            .startOf('month')
            .toJSDate();

          const endOfLastMonth = DateTime.now()
            .minus({ months: 1 })
            .endOf('month')
            .toJSDate();

          setStartDate(startOfLastMonth);
          setEndDate(endOfLastMonth);
        }
        break;
      case 'last7Days':
        {
          const startOfLast7Days = DateTime.now()
            .minus({ days: 7 })
            .startOf('day')
            .toJSDate();

          const endOfLast7Days = DateTime.now()
            .minus({ days: 1 })
            .endOf('day')
            .toJSDate();

          setStartDate(startOfLast7Days);
          setEndDate(endOfLast7Days);
        }
        break;
      case 'last30Days':
        {
          const startOfLast30Days = DateTime.now()
            .minus({ days: 30 })
            .startOf('day')
            .toJSDate();

          const endOfLast30Days = DateTime.now()
            .minus({ days: 1 })
            .endOf('day')
            .toJSDate();

          setStartDate(startOfLast30Days);
          setEndDate(endOfLast30Days);
        }
        break;
      default:
        break;
    }
  };

  const resetTimePeriod = () => {
    setTimePeriodOption('custom');
    setStartDate(before7DaysAgo);
    setEndDate(yesterday);
  };

  const getPreviousTimePeriod = () => {
    let previousStartDate = null;
    let previousEndDate = null;
    switch (timePeriodOption) {
      case 'custom':
        {
          const daysBetweenStartAndEnd = DateTime.fromJSDate(endDate!)
            .diff(DateTime.fromJSDate(startDate!), 'days')
            .toObject().days;
          previousStartDate = getDayBeforeGivenDayWithOffset(
            startDate!,
            daysBetweenStartAndEnd,
          );
          previousEndDate = getDayBeforeGivenDayWithOffset(
            endDate!,
            daysBetweenStartAndEnd,
          );
        }
        break;
      case 'today':
        previousStartDate = yesterday;
        previousEndDate = yesterday;
        break;
      case 'yesterday':
        previousStartDate = getDayBeforeGivenDayWithOffset(yesterday, 1);
        previousEndDate = getDayBeforeGivenDayWithOffset(yesterday, 1);
        break;
      case 'lastWeek':
        previousStartDate = DateTime.fromJSDate(startDate!)
          .minus({ weeks: 1 })
          .startOf('week')
          .toJSDate();

        previousEndDate = DateTime.fromJSDate(endDate!)
          .minus({ weeks: 1 })
          .endOf('week')
          .toJSDate();
        break;
      case 'lastMonth':
        previousStartDate = DateTime.fromJSDate(startDate!)
          .minus({ months: 1 })
          .startOf('month')
          .toJSDate();

        previousEndDate = DateTime.fromJSDate(endDate!)
          .minus({ months: 1 })
          .endOf('month')
          .toJSDate();
        break;
      case 'last7Days':
        previousStartDate = DateTime.fromJSDate(startDate!)
          .minus({ days: 7 })
          .startOf('day')
          .toJSDate();

        previousEndDate = DateTime.fromJSDate(endDate!)
          .minus({ days: 1 })
          .endOf('day')
          .toJSDate();
        break;
      case 'last30Days':
        previousStartDate = DateTime.fromJSDate(startDate!)
          .minus({ days: 30 })
          .startOf('day')
          .toJSDate();

        previousEndDate = DateTime.fromJSDate(endDate!)
          .minus({ days: 1 })
          .endOf('day')
          .toJSDate();
        break;
      default:
        break;
    }

    return {
      previousStartDate,
      previousEndDate,
    };
  };

  return {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    timePeriodOption,
    setTimePeriodOption,
    handleTimePeriodChange,
    resetTimePeriod,
    getPreviousTimePeriod,
  };
};
