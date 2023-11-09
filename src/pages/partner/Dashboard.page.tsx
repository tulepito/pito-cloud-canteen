import { useEffect, useMemo } from 'react';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { currentUserSelector } from '@redux/slices/user.slice';
import { CurrentUser } from '@src/utils/data';

import LatestOrders from './components/LatestOrders/LatestOrders';
import OrderCalendar from './components/OrderCalendar/OrderCalendar';
import OrdersAnalytics from './components/OrdersAnalytics/OrdersAnalytics';
import Overview from './components/Overview/Overview';
import RevenueAnalytics from './components/RevenueAnalytics/RevenueAnalytics';
import {
  calculateOverviewInformation,
  splitSubOrders,
} from './helpers/dashboardData';
import { useControlTimeRange } from './hooks/useControlTimeRange';
import { PartnerDashboardThunks } from './Dashboard.slice';

import css from './Dashboard.module.scss';

type TDashboardProps = {};

const Dashboard: React.FC<TDashboardProps> = () => {
  const dispatch = useAppDispatch();

  const { startDate, endDate, getPreviousTimePeriod } = useControlTimeRange();
  const currentOrderVATPercentage = useAppSelector(
    (state) => state.SystemAttributes.currentOrderVATPercentage,
  );
  const currentUser = useAppSelector(currentUserSelector);
  const currentUserGetter = CurrentUser(currentUser);
  const { restaurantListingId } = currentUserGetter.getMetadata();
  const subOrders = useAppSelector((state) => state.PartnerDashboard.subOrders);
  const fetchSubOrdersInProgress = useAppSelector(
    (state) => state.PartnerDashboard.fetchSubOrdersInProgress,
  );
  const previousSubOrders = useAppSelector(
    (state) => state.PartnerDashboard.previousSubOrders,
  );

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

  const previousOverviewInformation = useMemo(
    () =>
      calculateOverviewInformation(
        previousSubOrders,
        restaurantListingId,
        currentOrderVATPercentage,
      ),
    [previousSubOrders, restaurantListingId, currentOrderVATPercentage],
  );

  const previousOverviewData = {
    totalRevenue: previousOverviewInformation.revenue,
    totalCustomer: previousOverviewInformation.totalCustomers.length,
    totalOrders: previousOverviewInformation.totalOrders,
  };

  const splittedSubOrders = useMemo(
    () =>
      splitSubOrders(subOrders, restaurantListingId, currentOrderVATPercentage),
    [currentOrderVATPercentage, restaurantListingId, subOrders],
  );

  useEffect(() => {
    const { previousStartDate, previousEndDate } = getPreviousTimePeriod();
    dispatch(
      PartnerDashboardThunks.fetchSubOrders({
        currentSubOrderParams: {
          startDate: startDate?.getTime(),
          endDate: endDate?.getTime(),
        },
        previousSubOrdersParams: {
          startDate: previousStartDate?.getTime(),
          endDate: previousEndDate?.getTime(),
        },
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, endDate, startDate]);

  return (
    <div className={css.root}>
      <section className={css.section}>
        <Overview data={overviewData} previousData={previousOverviewData} />
      </section>
      <section className={css.section}>
        <OrdersAnalytics data={[]} />
      </section>
      <section className={css.section}>
        <RevenueAnalytics data={[]} />
      </section>
      <section className={css.section}>
        <LatestOrders data={splittedSubOrders} />
      </section>
      <section className={css.section}>
        <OrderCalendar
          data={splittedSubOrders}
          inProgress={fetchSubOrdersInProgress}
        />
      </section>
    </div>
  );
};

export default Dashboard;
