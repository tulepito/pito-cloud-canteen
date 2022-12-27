import type { Event } from 'react-big-calendar';

import EventTile from '../EventTile/EventTile';
import css from './DayColumn.module.scss';

type TDayColumnContentProps = {
  events: Event[];
};

const DayColumnContent: React.FC<TDayColumnContentProps> = ({ events }) => {
  // const groupEvents = getEventsInPeriod({ events });

  return (
    <div className={css.dayContent}>
      {/* {DAY_SESSIONS.filter((session) => groupEvents[session]?.length > 0).map(
        (session) => (
          <DaySession
            key={session}
            session={session}
            groupEvents={groupEvents[session]}
          />
        ),
      )} */}
      {events.map((event, index) => (
        <EventTile key={event.resource?.id} event={event} index={index} />
      ))}
    </div>
  );
};

export default DayColumnContent;
