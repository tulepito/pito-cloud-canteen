import 'react-big-calendar/lib/css/react-big-calendar.css';

import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import EventCard from '@components/CalendarDashboard/components/EventCard/EventCard';
import { EVENTS_MOCKUP } from '@components/CalendarDashboard/helpers/mockupData';

import css from './CalendarPage.module.scss';

function CalendarPage() {
  return (
    <div className={css.root}>
      <CalendarDashboard events={EVENTS_MOCKUP} renderEvent={EventCard} />
    </div>
  );
}

export default CalendarPage;
