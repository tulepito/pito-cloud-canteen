import { useState } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import { DateTime } from 'luxon';

import { DAY_IN_WEEK } from '@components/CalendarDashboard/helpers/constant';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconCalendar from '@components/Icons/IconCalender/IconCalender';
import { formatTimestamp } from '@src/utils/dates';

import css from './CalendarDayController.module.scss';

type TCalendarDayControllerProps = {
  startDate: Date;
  endDate: Date;
  activeDayList: string[];
  onDayClick?: (day: string) => void;
};

const CalendarDayController: React.FC<TCalendarDayControllerProps> = (
  props,
) => {
  const { activeDayList, startDate, endDate, onDayClick } = props;
  const intl = useIntl();
  const [currentStartWeekDay, setCurrentStartWeekDay] =
    useState<Date>(startDate);

  const [currentEndWeekDay, setCurrentEndWeekDay] = useState<Date>(
    DateTime.fromJSDate(startDate).plus({ days: 6 }).toJSDate(),
  );

  const isSameMonth =
    currentStartWeekDay.getMonth() === currentEndWeekDay.getMonth();

  const dateTitle = isSameMonth
    ? `${formatTimestamp(
        currentStartWeekDay.getTime(),
        'dd',
      )} - ${formatTimestamp(currentEndWeekDay.getTime(), 'dd MMMM')}`
    : `${formatTimestamp(
        currentStartWeekDay.getTime(),
        'dd MMMM',
      )} - ${formatTimestamp(currentEndWeekDay.getTime(), 'dd MMMM')}`;

  const disabledPrevWeek = currentStartWeekDay.getTime() <= startDate.getTime();
  const disabledNextWeek = currentEndWeekDay.getTime() >= endDate.getTime();

  const onPrevWeek = () => {
    setCurrentStartWeekDay(
      DateTime.fromJSDate(currentStartWeekDay).minus({ weeks: 1 }).toJSDate(),
    );
    setCurrentEndWeekDay(
      DateTime.fromJSDate(currentEndWeekDay).minus({ weeks: 1 }).toJSDate(),
    );
  };

  const onNextWeek = () => {
    setCurrentStartWeekDay(
      DateTime.fromJSDate(currentStartWeekDay).plus({ weeks: 1 }).toJSDate(),
    );
    setCurrentEndWeekDay(
      DateTime.fromJSDate(currentEndWeekDay).plus({ weeks: 1 }).toJSDate(),
    );
  };

  const handleDayClick = (day: string) => () => {
    onDayClick?.(day);
  };

  return (
    <div className={css.root}>
      <div className={css.dateTitleWrapper}>
        <IconArrow
          direction="left"
          onClick={onPrevWeek}
          className={classNames(css.icon, disabledPrevWeek && css.disabled)}
        />
        <div className={css.dateTitle}>
          <IconCalendar />
          <span>{dateTitle}</span>
        </div>
        <IconArrow
          direction="right"
          onClick={onNextWeek}
          className={classNames(css.icon, disabledNextWeek && css.disabled)}
        />
      </div>
      <div className={css.weekDayWrapper}>
        {DAY_IN_WEEK.map((day) => {
          return (
            <div
              key={day}
              onClick={handleDayClick(day.slice(0, 3))}
              className={classNames(css.weekDay, {
                [css.actived]: activeDayList.includes(day.slice(0, 3)),
              })}>
              {intl.formatMessage({
                id: `MonthView.dayInWeekHeader.short.${day}`,
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarDayController;
