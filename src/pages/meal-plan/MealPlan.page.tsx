import 'react-big-calendar/lib/css/react-big-calendar.css';

import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import AddMorePlan from '@components/CalendarDashboard/components/MealPlanCard/components/AddMorePlan';
import MealPlanCard from '@components/CalendarDashboard/components/MealPlanCard/MealPlanCard';
import { MEAL_PLANS_MOCKUP } from '@components/CalendarDashboard/helpers/mockupData';

import css from './MealPlan.module.scss';

function MealPlanPage() {
  return (
    <div className={css.root}>
      <CalendarDashboard
        events={MEAL_PLANS_MOCKUP}
        renderEvent={MealPlanCard}
        companyLogo="Chu"
        components={{
          contentEnd: (props) => <AddMorePlan {...props} />,
        }}
      />
    </div>
  );
}

export default MealPlanPage;
