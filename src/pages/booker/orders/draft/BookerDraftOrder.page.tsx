import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import AddMorePlan from '@components/CalendarDashboard/components/MealPlanCard/AddMorePlan';
import MealPlanCard from '@components/CalendarDashboard/components/MealPlanCard/MealPlanCard';
import { MEAL_PLANS_MOCKUP } from '@components/CalendarDashboard/helpers/mockupData';
import { DateTime } from 'luxon';
import { useState } from 'react';

import Layout from '../components/Layout/Layout';
import LayoutMain from '../components/Layout/LayoutMain';
import LayoutSidebar from '../components/Layout/LayoutSidebar';
import css from './BookerDraftOrder.module.scss';
import SidebarContent from './components/SidebarContent/SidebarContent';
import Toolbar from './components/Toolbar/Toolbar';

function BookerDraftOrderPage() {
  const [collapse, setCollapse] = useState(false);

  const handleCollapse = () => {
    setCollapse(!collapse);
  };

  const startDate = DateTime.fromJSDate(new Date()).startOf('week').toJSDate();
  const endDate = DateTime.fromJSDate(new Date()).endOf('week').toJSDate();

  return (
    <Layout>
      <LayoutSidebar
        logo={<span></span>}
        collapse={collapse}
        onCollapse={handleCollapse}>
        <SidebarContent />
      </LayoutSidebar>
      <LayoutMain>
        <div className={css.main}>
          <CalendarDashboard
            className={css.calendar}
            anchorDate={new Date()}
            startDate={startDate}
            endDate={endDate}
            events={MEAL_PLANS_MOCKUP}
            renderEvent={MealPlanCard}
            companyLogo="Company"
            hideMonthView
            components={{
              contentEnd: (props) => (
                <AddMorePlan
                  {...props}
                  startDate={startDate}
                  endDate={endDate}
                />
              ),
              toolbar: (props) => <Toolbar {...props} />,
            }}
          />
        </div>
      </LayoutMain>
    </Layout>
  );
}

export default BookerDraftOrderPage;
