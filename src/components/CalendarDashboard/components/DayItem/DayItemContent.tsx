import type { Event } from 'react-big-calendar';

import type { TCalendarItemCardComponents } from '../../helpers/types';
import css from './DayItem.module.scss';

type TDayColumnContentProps = {
  date: Date;
  events: Event[];
  resources?: any;
  renderEvent?: React.FC<any>;
  components?: TCalendarItemCardComponents;
};

const DayColumnContent: React.FC<TDayColumnContentProps> = ({
  date,
  events,
  resources,
  renderEvent: EventRender,
  components,
}) => {
  const { contentEnd } = components || {};

  return (
    <div className={css.dayContent}>
      {EventRender &&
        events.map((event, index) => (
          <EventRender
            key={event.resource?.id}
            event={event}
            index={index}
            resources={resources}
          />
        ))}
      {contentEnd && <div>{contentEnd({ events, date, resources })}</div>}
    </div>
  );
};

export default DayColumnContent;
