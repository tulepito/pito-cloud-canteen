import { useEffect, useMemo } from 'react';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { currentUserSelector } from '@redux/slices/user.slice';
import { CurrentUser } from '@src/utils/data';

import LatestOrders from './components/LatestOrders/LatestOrders';
import OrderCalendar from './components/OrderCalendar/OrderCalendar';
import OrdersAnalytics from './components/OrdersAnalytics/OrdersAnalytics';
import Overview from './components/Overview/Overview';
import RevenueAnalytics from './components/RevenueAnalytics/RevenueAnalytics';
import { calculateOverviewInformation } from './helpers/dashboardData';
import { useControlTimeRange } from './hooks/useControlTimeRange';
import { PartnerDashboardThunks } from './Dashboard.slice';

import css from './Dashboard.module.scss';

type TDashboardProps = {};

const Dashboard: React.FC<TDashboardProps> = () => {
  const dispatch = useAppDispatch();

  const { startDate, endDate } = useControlTimeRange();
  const currentOrderVATPercentage = useAppSelector(
    (state) => state.SystemAttributes.currentOrderVATPercentage,
  );
  const currentUser = useAppSelector(currentUserSelector);
  const currentUserGetter = CurrentUser(currentUser);
  const { restaurantListingId } = currentUserGetter.getMetadata();
  const subOrders = useAppSelector((state) => state.PartnerDashboard.subOrders);

  const overviewInformation = useMemo(
    () =>
      calculateOverviewInformation(
        subOrders,
        restaurantListingId,
        currentOrderVATPercentage,
      ),
    [subOrders, restaurantListingId, currentOrderVATPercentage],
  );
  const overviewData = {
    totalRevenue: overviewInformation.revenue,
    totalCustomer: overviewInformation.totalCustomers.length,
    totalOrders: overviewInformation.totalOrders,
  };

  useEffect(() => {
    dispatch(
      PartnerDashboardThunks.fetchSubOrders({
        startDate: startDate?.getTime(),
        endDate: endDate?.getTime(),
      }),
    );
  }, [dispatch, endDate, startDate]);

  return (
    <div className={css.root}>
      <section className={css.section}>
        <Overview data={overviewData} />
      </section>
      <section className={css.section}>
        <OrdersAnalytics data={[]} />
      </section>
      <section className={css.section}>
        <RevenueAnalytics data={[]} />
      </section>
      <section className={css.section}>
        <LatestOrders data={[]} />
      </section>
      <section className={css.section}>
        <OrderCalendar data={[]} />
      </section>
    </div>
  );
};

export default Dashboard;
