import 'react-big-calendar/lib/css/react-big-calendar.css';

import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import EventTile from '@components/CalendarDashboard/components/EventTile/EventTile';
import { EVENTS_MOCKUP } from '@components/CalendarDashboard/helpers/mockupData';

import css from './CalendarPage.module.scss';

function CalendarPage() {
  return (
    <div className={css.root}>
      <CalendarDashboard events={EVENTS_MOCKUP} renderEvent={EventTile} />
    </div>
  );
}

export default CalendarPage;
