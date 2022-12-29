import classNames from 'classnames';
import type { Duration } from 'luxon';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import css from './CountdownTimer.module.scss';

type TCountdownTimerProps = {
  className?: string;
  deadline: number;
};

const CountdownTimer: React.FC<TCountdownTimerProps> = ({
  className,
  deadline,
}) => {
  const [diffTime, setDiffTime] = useState<Duration | null>(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const diffObj = DateTime.fromMillis(parseInt(`${deadline}`, 10)).diffNow([
        'day',
        'hour',
        'minute',
        'second',
        'millisecond',
      ]);
      setDiffTime(diffObj);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className={classNames(css.root, className)}>
      <div className={css.boxItem}>
        <div className={css.value}>{diffTime?.get('day')}</div>
        <div className={css.label}>
          <FormattedMessage id="CountDownTimer.day" />
        </div>
      </div>
      <div className={css.boxItem}>
        <div className={css.value}>{diffTime?.get('hour')}</div>
        <div className={css.label}>
          <FormattedMessage id="CountDownTimer.hour" />
        </div>
      </div>
      <div className={css.boxItem}>
        <div className={css.value}>{diffTime?.get('minute')}</div>
        <div className={css.label}>
          <FormattedMessage id="CountDownTimer.minute" />
        </div>
      </div>
      <div className={css.boxItem}>
        <div className={css.value}>{diffTime?.get('second')}</div>
        <div className={css.label}>
          <FormattedMessage id="CountDownTimer.second" />
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
