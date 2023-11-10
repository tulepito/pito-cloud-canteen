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
  formatChartData,
  splitSubOrders,
} from './helpers/dashboardData';
import { useControlTimeFrame } from './hooks/useControlTimeFrame';
import { useControlTimeRange } from './hooks/useControlTimeRange';
import { PartnerDashboardThunks } from './Dashboard.slice';

import css from './Dashboard.module.scss';

type TDashboardProps = {};

const Dashboard: React.FC<TDashboardProps> = () => {
  const dispatch = useAppDispatch();

  const { startDate, endDate, getPreviousTimePeriod } = useControlTimeRange();
  const { analyticsOrdersTimeFrame } = useControlTimeFrame();

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
  const analyticsOrderChartData = useMemo(
    () =>
      formatChartData({
        subOrders: splittedSubOrders,
        timeFrame: analyticsOrdersTimeFrame,
        startDate: new Date(startDate!),
        endDate: new Date(endDate!),
      }),
    [analyticsOrdersTimeFrame, endDate, splittedSubOrders, startDate],
  );

  useEffect(() => {
    const { previousStartDate, previousEndDate } = getPreviousTimePeriod();
    if (startDate && endDate) {
      dispatch(
        PartnerDashboardThunks.fetchSubOrders({
          currentSubOrderParams: {
            startDate,
            endDate,
          },
          previousSubOrdersParams: {
            startDate: previousStartDate,
            endDate: previousEndDate,
          },
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, endDate, startDate]);

  return (
    <div className={css.root}>
      <section className={css.section}>
        <Overview data={overviewData} previousData={previousOverviewData} />
      </section>
      <section className={css.section}>
        <OrdersAnalytics
          data={splittedSubOrders}
          overviewData={overviewData}
          chartData={analyticsOrderChartData}
          inProgress={fetchSubOrdersInProgress}
        />
      </section>
      <section className={css.section}>
        <RevenueAnalytics data={splittedSubOrders} />
      </section>
      <section className={css.section}>
        <LatestOrders data={splittedSubOrders.slice(0, 5)} />
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
