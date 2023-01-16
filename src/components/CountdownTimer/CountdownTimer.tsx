import classNames from 'classnames';
import type { Duration } from 'luxon';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';

import CountdownItem from './CountdownItem';
import css from './CountdownTimer.module.scss';
import { getStopTime } from './helpers';

type TStopAt = {
  day: number;
  hour: number;
  minute: number;
  second: number;
};

type TCountdownTimerProps = {
  className?: string;
  deadline: number;
  stopAt?: 0 | TStopAt;
};

const CountdownTimer: React.FC<TCountdownTimerProps> = ({
  className,
  deadline,
  stopAt,
}) => {
  const [diffTime, setDiffTime] = useState<Duration | null>(null);

  useEffect(() => {
    const stopTime = getStopTime(stopAt);
    const intervalId = setInterval(() => {
      const diffObj = DateTime.fromMillis(parseInt(`${deadline}`, 10)).diffNow([
        'day',
        'hour',
        'minute',
        'second',
      ]);
      if (stopTime) {
        if (
          diffObj.get('day') <= stopTime.day &&
          diffObj.get('hour') <= stopTime.hour &&
          diffObj.get('minute') <= stopTime.minute &&
          diffObj.get('second') <= stopTime.second
        ) {
          clearInterval(intervalId);
        }
      }
      setDiffTime(diffObj);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [stopAt, deadline]);

  return (
    <div className={classNames(css.root, className)}>
      <CountdownItem type="day" diffTime={diffTime} />
      <CountdownItem type="hour" diffTime={diffTime} />
      <CountdownItem type="minute" diffTime={diffTime} />
      <CountdownItem type="second" diffTime={diffTime} />
    </div>
  );
};

export default CountdownTimer;
