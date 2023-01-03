import 'react-big-calendar/lib/css/react-big-calendar.css';

import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import OrderEventCard from '@components/CalendarDashboard/components/OrderEventCard/OrderEventCard';
import { EVENTS_MOCKUP } from '@components/CalendarDashboard/helpers/mockupData';

import css from './CalendarPage.module.scss';

function CalendarPage() {
  return (
    <div className={css.root}>
      <CalendarDashboard
        events={EVENTS_MOCKUP}
        renderEvent={OrderEventCard}
        companyLogo="Chu"
      />
    </div>
  );
}

export default CalendarPage;
