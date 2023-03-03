import type { Event } from 'react-big-calendar';

import type { TObject } from '@utils/types';

import type { TCalendarItemCardComponents } from '../../helpers/types';

import css from './DayItem.module.scss';

type TDayColumnContentProps = {
  date: Date;
  events: Event[];
  resources?: any;
  renderEvent?: React.FC<any>;
  components?: TCalendarItemCardComponents;
  eventExtraProps?: TObject;
};

const DayColumnContent: React.FC<TDayColumnContentProps> = ({
  date,
  events,
  resources,
  renderEvent: EventRender,
  components,
  eventExtraProps,
}) => {
  const { contentEnd, contentStart } = components || {};

  return (
    <div className={css.dayContent}>
      {contentStart && <div>{contentStart({ events, date })}</div>}
      {EventRender &&
        events.map((event, index) => (
          <EventRender
            key={event.resource?.id}
            event={event}
            index={index}
            eventExtraProps={eventExtraProps}
            resources={resources}
          />
        ))}
      {contentEnd && <div>{contentEnd({ events, date, resources })}</div>}
    </div>
  );
};

export default DayColumnContent;
