import React from 'react';
import { FormattedMessage } from 'react-intl';

import type { TDayColumnHeaderProps } from '@components/CalendarDashboard/helpers/types';
import { getDayOfWeekByIndex } from '@utils/dates';

import css from './DayOfWeekCalendarHeader.module.scss';

const DayOfWeekCalendarHeader: React.FC<TDayColumnHeaderProps> = ({ date }) => {
  const dayOfWeek = getDayOfWeekByIndex(date.getDay() - 1);

  return (
    <div className={css.root}>
      <FormattedMessage id={`DayOfWeekCalendarHeader.${dayOfWeek}`} />
    </div>
  );
};

export default DayOfWeekCalendarHeader;
