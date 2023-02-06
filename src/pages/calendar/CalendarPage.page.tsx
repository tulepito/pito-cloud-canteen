import 'react-big-calendar/lib/css/react-big-calendar.css';

import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import AddMorePlan from '@components/CalendarDashboard/components/MealPlanCard/components/AddMorePlan';
import { MEAL_PLANS_MOCKUP } from '@components/CalendarDashboard/helpers/mockupData';

import css from './CalendarPage.module.scss';

function CalendarPage() {
  return (
    <div className={css.root}>
      <CalendarDashboard
        events={MEAL_PLANS_MOCKUP}
        renderEvent={AddMorePlan}
        companyLogo={'Company'}
      />
    </div>
  );
}

export default CalendarPage;
