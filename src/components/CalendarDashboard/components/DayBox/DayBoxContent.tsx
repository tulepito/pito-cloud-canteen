import type { Event } from 'react-big-calendar';

import css from './DayBox.module.scss';

type TDayBoxContentProps = {
  events: Event[];
  renderEvent?: React.FC<any>;
};

const DayBoxContent: React.FC<TDayBoxContentProps> = ({
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

export default DayBoxContent;
