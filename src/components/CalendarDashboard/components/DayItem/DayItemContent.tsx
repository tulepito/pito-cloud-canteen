import type { Event } from 'react-big-calendar';

import type { TCalendarItemCardComponents } from '../../helpers/types';
import css from './DayItem.module.scss';

type TDayColumnContentProps = {
  events: Event[];
  renderEvent?: React.FC<any>;
  components?: TCalendarItemCardComponents;
};

const DayColumnContent: React.FC<TDayColumnContentProps> = ({
  events,
  renderEvent: EventRender,
  components,
}) => {
  const { contentEnd } = components || {};

  return (
    <div className={css.dayContent}>
      {EventRender &&
        events.map((event, index) => (
          <EventRender key={event.resource?.id} event={event} index={index} />
        ))}
      {contentEnd && <div>{contentEnd({ events })}</div>}
    </div>
  );
};

export default DayColumnContent;
