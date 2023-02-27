import { DateTime } from 'luxon';

export const getStartDate = (timestamp: number) => {
  const nextStartWeek = DateTime.fromJSDate(new Date())
    .startOf('week')
    .startOf('day')
    .plus({ days: 7 })
    .toJSDate();

  return timestamp
    ? DateTime.fromMillis(Number(timestamp)).startOf('day').toJSDate()
    : nextStartWeek;
};

export const getEndDate = (timestamp: number) => {
  const nextEndWeek = DateTime.fromJSDate(new Date())
    .endOf('week')
    .endOf('day')
    .plus({ days: 7 })
    .toJSDate();

  return timestamp
    ? DateTime.fromMillis(Number(timestamp)).endOf('day').toJSDate()
    : nextEndWeek;
};
