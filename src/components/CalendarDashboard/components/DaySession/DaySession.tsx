import type { Event } from 'react-big-calendar';
import { FormattedMessage } from 'react-intl';

import type { TDaySession } from '@components/CalendarDashboard/helpers/types';

import OrderEventCard from '../OrderEventCard/OrderEventCard';

import css from './DaySession.module.scss';

type TDaySessionProps = {
  groupEvents: Event[];
  session: TDaySession;
};

const DaySession: React.FC<TDaySessionProps> = ({ session, groupEvents }) => {
  return (
    <div key={session} className={css.daySession}>
      <div className={css.daySessionTitle}>
        <FormattedMessage id={`DayColumn.Session.${session}`} />
      </div>
      {groupEvents.map((event: Event, index: number) => {
        return (
          <OrderEventCard
            key={event.resource?.id}
            event={event}
            index={index}
          />
        );
      })}
    </div>
  );
};

export default DaySession;
