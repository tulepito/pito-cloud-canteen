import type { Duration } from 'luxon';
import { FormattedMessage } from 'react-intl';

import css from './CountdownTimer.module.scss';

type TCountdownItemProps = {
  type: 'day' | 'hour' | 'minute' | 'second';
  diffTime: Duration | null;
};

const CountdownItem: React.FC<TCountdownItemProps> = ({ type, diffTime }) => {
  return (
    <div className={css.boxItem}>
      <div className={css.value}>
        {type === 'second'
          ? Math.round(diffTime?.get(type) || 0)
          : diffTime?.get(type) || 0}
      </div>
      <div className={css.label}>
        <FormattedMessage id={`CountDownTimer.${type}`} />
      </div>
    </div>
  );
};

export default CountdownItem;
