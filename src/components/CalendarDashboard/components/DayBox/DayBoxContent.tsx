import type { Event } from 'react-big-calendar';

import EventTile from '../EventTile/EventTile';
import css from './DayBox.module.scss';

type TDayBoxContentProps = {
  events: Event[];
};

const DayBoxContent: React.FC<TDayBoxContentProps> = ({ events }) => {
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

export default DayBoxContent;
