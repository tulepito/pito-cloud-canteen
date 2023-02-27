import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import MealPlanCard from '@components/CalendarDashboard/components/MealPlanCard/MealPlanCard';
import { useAppDispatch } from '@hooks/reduxHooks';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';

import Layout from '../../components/Layout/Layout';
import LayoutMain from '../../components/Layout/LayoutMain';
import LayoutSidebar from '../../components/Layout/LayoutSidebar';
import css from './BookerDraftOrder.module.scss';
import SidebarContent from './components/SidebarContent/SidebarContent';
import { useGetPlanDetails, useLoadData } from './hooks/loadData';
import {
  useGetCalendarCompononentProps,
  useGetCalendarExtraResources,
} from './restaurants/hooks/calendar';
import { useGetBoundaryDates } from './restaurants/hooks/dateTime';

function BookerDraftOrderPage() {
  const router = useRouter();
  const { orderId } = router.query;
  const [collapse, setCollapse] = useState(false);

  const dispatch = useAppDispatch();

  const { order, companyAccount } = useLoadData({
    orderId: orderId as string,
  });

  const { orderDetail = [] } = useGetPlanDetails();

  const { startDate, endDate } = useGetBoundaryDates(order);

  const calendarExtraResources = useGetCalendarExtraResources({
    order,
    startDate,
    endDate,
  });

  const handleCollapse = useCallback(() => {
    setCollapse(!collapse);
  }, [collapse]);

  const handleRemoveMeal = useCallback(
    (id: string) => (resourceId: string) => {
      dispatch(
        orderAsyncActions.updatePlanDetail({
          orderId,
          planId: id,
          orderDetail: {
            [resourceId]: null,
          },
          updateMode: 'merge',
        }),
      );
    },
    [dispatch, orderId],
  );

  const componentsProps = useGetCalendarCompononentProps({
    startDate,
    endDate,
  });

  return (
    <Layout className={css.root}>
      <LayoutSidebar
        logo={<span></span>}
        collapse={collapse}
        onCollapse={handleCollapse}>
        <SidebarContent order={order} companyAccount={companyAccount} />
      </LayoutSidebar>
      <LayoutMain>
        <div className={css.main}>
          <CalendarDashboard
            className={css.calendar}
            anchorDate={startDate}
            startDate={startDate}
            endDate={endDate}
            events={orderDetail}
            renderEvent={(props: any) => (
              <MealPlanCard
                {...props}
                removeInprogress={props?.resources?.updatePlanDetailInprogress}
                onRemove={handleRemoveMeal(props?.resources?.planId)}
              />
            )}
            companyLogo="Company"
            hideMonthView
            resources={calendarExtraResources}
            components={componentsProps}
          />
        </div>
      </LayoutMain>
    </Layout>
  );
}

export default BookerDraftOrderPage;
