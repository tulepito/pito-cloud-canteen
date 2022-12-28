import type { Event } from 'react-big-calendar';

import css from './DayColumn.module.scss';

type TDayColumnContentProps = {
  events: Event[];
  renderEvent?: React.FC<any>;
};

const DayColumnContent: React.FC<TDayColumnContentProps> = ({
  events,
  renderEvent: EventRender,
}) => {
  return (
    <div className={css.dayContent}>
      {EventRender &&
        events.map((event, index) => (
          <EventRender key={event.resource?.id} event={event} index={index} />
        ))}
    </div>
  );
};

export default DayColumnContent;
