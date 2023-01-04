import type { TStopAt } from './types';

const getDefautStopTime = () => {
  return { day: 0, hour: 0, minute: 0, second: 0 };
};

const getCustomStopTime = (stopAt: TStopAt) => {
  return {
    day: stopAt.day || 0,
    hour: stopAt.hour || 0,
    minute: stopAt.minute || 0,
    second: stopAt.second || 0,
  };
};

export const getStopTime = (stopAt?: 0 | TStopAt) => {
  const shouldStop = stopAt === 0 || !!stopAt;
  const defautStopTime = getDefautStopTime();
  const customStopTime =
    typeof stopAt === 'object' ? getCustomStopTime(stopAt) : null;
  const stopTime = customStopTime || defautStopTime;

  return shouldStop ? stopTime : null;
};
