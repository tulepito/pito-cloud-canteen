import { useEffect } from 'react';
import { DateTime } from 'luxon';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  getDayBeforeGivenDayWithOffset,
  getYesterday,
  VNTimezone,
} from '@src/utils/dates';
import { ETimePeriodOption } from '@src/utils/enums';

import { PartnerDashboardActions } from '../Dashboard.slice';

export const timePeriodOptions = [
  {
    key: ETimePeriodOption.TODAY,
    label: 'Hôm nay',
  },
  {
    key: ETimePeriodOption.YESTERDAY,
    label: 'Hôm qua',
  },
  {
    key: ETimePeriodOption.LAST_WEEK,
    label: 'Tuần trước',
  },
  {
    key: ETimePeriodOption.LAST_MONTH,
    label: 'Tháng trước',
  },
  {
    key: ETimePeriodOption.LAST_7_DAYS,
    label: '7 ngày trước',
  },
  {
    key: ETimePeriodOption.LAST_30_DAYS,
    label: '30 ngày trước',
  },
];

export const useControlTimeRange = () => {
  const dispatch = useAppDispatch();
  const today = DateTime.now().setZone(VNTimezone).startOf('day').toMillis();
  const yesterday = getYesterday().getTime();
  const before7DaysAgo = getDayBeforeGivenDayWithOffset(new Date(yesterday), 6);

  const startDate = useAppSelector((state) => state.PartnerDashboard.startDate);
  const endDate = useAppSelector((state) => state.PartnerDashboard.endDate);
  const timePeriodOption = useAppSelector(
    (state) => state.PartnerDashboard.timePeriodOption,
  );

  const setStartDate = (date: number) => {
    dispatch(PartnerDashboardActions.setStartDate(date));
  };

  const setEndDate = (date: number) => {
    dispatch(PartnerDashboardActions.setEndDate(date));
  };

  const setTimePeriodOption = (option: ETimePeriodOption) => {
    dispatch(PartnerDashboardActions.setTimePeriodOption(option));
  };

  const handleTimePeriodChange = (value: ETimePeriodOption) => {
    setTimePeriodOption(value);
    switch (value) {
      case ETimePeriodOption.TODAY:
        setStartDate(today);
        setEndDate(today);
        break;
      case ETimePeriodOption.YESTERDAY:
        setStartDate(yesterday);
        setEndDate(yesterday);
        break;
      case ETimePeriodOption.LAST_WEEK:
        {
          const startOfLastWeek = DateTime.now()
            .setZone(VNTimezone)
            .minus({ weeks: 1 })
            .startOf('week')
            .startOf('day')
            .toMillis();

          const endOfLastWeek = DateTime.now()
            .setZone(VNTimezone)
            .minus({ weeks: 1 })
            .endOf('week')
            .startOf('day')
            .toMillis();
          setStartDate(startOfLastWeek);
          setEndDate(endOfLastWeek);
        }
        break;
      case ETimePeriodOption.LAST_MONTH:
        {
          const startOfLastMonth = DateTime.now()
            .setZone(VNTimezone)
            .minus({ months: 1 })
            .startOf('month')
            .startOf('day')
            .toMillis();

          const endOfLastMonth = DateTime.now()
            .setZone(VNTimezone)
            .minus({ months: 1 })
            .endOf('month')
            .startOf('day')
            .toMillis();

          setStartDate(startOfLastMonth);
          setEndDate(endOfLastMonth);
        }
        break;
      case ETimePeriodOption.LAST_7_DAYS:
        {
          const startOfLast7Days = DateTime.now()
            .minus({ days: 7 })
            .startOf('day')
            .toMillis();

          const endOfLast7Days = DateTime.now()
            .minus({ days: 1 })
            .endOf('day')
            .toMillis();

          setStartDate(startOfLast7Days);
          setEndDate(endOfLast7Days);
        }
        break;
      case ETimePeriodOption.LAST_30_DAYS:
        {
          const startOfLast30Days = DateTime.now()
            .minus({ days: 30 })
            .startOf('day')
            .toMillis();

          const endOfLast30Days = DateTime.now()
            .minus({ days: 1 })
            .endOf('day')
            .toMillis();

          setStartDate(startOfLast30Days);
          setEndDate(endOfLast30Days);
        }
        break;
      default:
        break;
    }
  };

  const resetTimePeriod = () => {
    setTimePeriodOption(ETimePeriodOption.CUSTOM);
    setStartDate(before7DaysAgo);
    setEndDate(yesterday);
  };

  const getPreviousTimePeriod = () => {
    let previousStartDate = null;
    let previousEndDate = null;
    if (!startDate || !endDate)
      return {
        previousStartDate,
        previousEndDate,
      };

    switch (timePeriodOption) {
      case ETimePeriodOption.CUSTOM:
        {
          const daysBetweenStartAndEnd = DateTime.fromMillis(endDate!)
            .diff(DateTime.fromMillis(startDate!), 'days')
            .toObject().days;
          previousStartDate = getDayBeforeGivenDayWithOffset(
            new Date(startDate!),
            daysBetweenStartAndEnd,
          );
          previousEndDate = getDayBeforeGivenDayWithOffset(
            new Date(endDate!),
            daysBetweenStartAndEnd,
          );
        }
        break;
      case ETimePeriodOption.TODAY:
        previousStartDate = yesterday;
        previousEndDate = yesterday;
        break;
      case ETimePeriodOption.YESTERDAY:
        previousStartDate = getDayBeforeGivenDayWithOffset(
          new Date(yesterday),
          1,
        );
        previousEndDate = getDayBeforeGivenDayWithOffset(
          new Date(yesterday),
          1,
        );
        break;
      case ETimePeriodOption.LAST_WEEK:
        previousStartDate = DateTime.fromMillis(startDate!)
          .minus({ weeks: 1 })
          .startOf('week')
          .toMillis();

        previousEndDate = DateTime.fromMillis(endDate!)
          .minus({ weeks: 1 })
          .endOf('week')
          .toMillis();
        break;
      case ETimePeriodOption.LAST_MONTH:
        previousStartDate = DateTime.fromMillis(startDate!)
          .minus({ months: 1 })
          .startOf('month')
          .toMillis();

        previousEndDate = DateTime.fromMillis(endDate!)
          .minus({ months: 1 })
          .endOf('month')
          .toMillis();
        break;
      case ETimePeriodOption.LAST_7_DAYS:
        previousStartDate = DateTime.fromMillis(startDate!)
          .minus({ days: 7 })
          .startOf('day')
          .toMillis();

        previousEndDate = DateTime.fromMillis(endDate!)
          .minus({ days: 1 })
          .endOf('day')
          .toMillis();
        break;
      case ETimePeriodOption.LAST_30_DAYS:
        previousStartDate = DateTime.fromMillis(startDate!)
          .minus({ days: 30 })
          .startOf('day')
          .toMillis();

        previousEndDate = DateTime.fromMillis(endDate!)
          .minus({ days: 1 })
          .endOf('day')
          .toMillis();
        break;
      default:
        break;
    }

    return {
      previousStartDate,
      previousEndDate,
    };
  };

  useEffect(() => {
    setStartDate(before7DaysAgo);
    setEndDate(yesterday);
  }, []);

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
