import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';

import type { TDayColumnHeaderProps } from '@components/CalendarDashboard/helpers/types';
import { MAX_MOBILE_SCREEN_WIDTH, useViewport } from '@hooks/useViewport';

import css from './DayItem.module.scss';

const DayColumnHeader: React.FC<TDayColumnHeaderProps> = ({
  isCurrentDay,
  date,
  className,
}) => {
  const {
    viewport: { width },
  } = useViewport();
  const isMobile = width < MAX_MOBILE_SCREEN_WIDTH;

  return (
    <div
      className={classNames(
        css.dayHeader,
        {
          [css.activeHeader]: isCurrentDay,
        },
        className,
      )}>
      <div className={css.dateNumber}>{date.getDate()}</div>
      <div className={css.dayText}>
        <FormattedMessage
          id={`Calendar.week.dayHeader.${
            isMobile ? 'short.' : ''
          }${date.getDay()}`}
          values={{ date: date.getDate(), month: date.getMonth() + 1 }}
        />
      </div>
    </div>
  );
};

export default DayColumnHeader;
