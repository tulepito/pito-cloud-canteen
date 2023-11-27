/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo } from 'react';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { currentUserSelector } from '@redux/slices/user.slice';
import { CurrentUser } from '@src/utils/data';
import { ETimeFrame, ETimePeriodOption } from '@src/utils/enums';
import { ETransition } from '@src/utils/transaction';

import LatestOrders from './components/LatestOrders/LatestOrders';
import OrderCalendar from './components/OrderCalendar/OrderCalendar';
import OrdersAnalytics from './components/OrdersAnalytics/OrdersAnalytics';
import Overview from './components/Overview/Overview';
import RevenueAnalytics from './components/RevenueAnalytics/RevenueAnalytics';
import {
  calculateOverviewInformation,
  formatChartData,
  sortLatestSubOrders,
  splitSubOrders,
} from './helpers/dashboardData';
import { useControlTimeFrame } from './hooks/useControlTimeFrame';
import { useControlTimeRange } from './hooks/useControlTimeRange';
import { PartnerDashboardThunks } from './Dashboard.slice';

import css from './Dashboard.module.scss';

type TDashboardProps = {};

const Dashboard: React.FC<TDashboardProps> = () => {
  const dispatch = useAppDispatch();

  const {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    getPreviousTimePeriod,
    timePeriodOption,
    handleTimePeriodChange,
    resetTimePeriod,
  } = useControlTimeRange();
  const {
    analyticsOrdersTimeFrame,
    analyticsRevenueTimeFrame,
    setAnalyticsOrdersTimeFrame,
    setAnalyticsRevenueTimeFrame,
  } = useControlTimeFrame();

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
  const latestSubOrders = useAppSelector(
    (state) => state.PartnerDashboard.latestSubOrders,
  );

  const { previousStartDate, previousEndDate } = getPreviousTimePeriod();

  const splittedSubOrders = useMemo(
    () =>
      splitSubOrders(
        subOrders,
        restaurantListingId,
        currentOrderVATPercentage,
        startDate!,
        endDate!,
      ),
    [
      currentOrderVATPercentage,
      endDate,
      restaurantListingId,
      startDate,
      subOrders,
    ],
  );

  const previousSplittedSubOrders = useMemo(
    () =>
      splitSubOrders(
        previousSubOrders,
        restaurantListingId,
        currentOrderVATPercentage,
        previousStartDate!,
        previousEndDate!,
      ),
    [
      previousSubOrders,
      restaurantListingId,
      currentOrderVATPercentage,
      previousStartDate,
      previousEndDate,
    ],
  );

  const latestSplittedSubOrders = useMemo(
    () =>
      splitSubOrders(
        latestSubOrders,
        restaurantListingId,
        currentOrderVATPercentage,
        new Date().setHours(0, 0, 0, 0),
        undefined,
      ).sort(sortLatestSubOrders),
    [currentOrderVATPercentage, latestSubOrders, restaurantListingId],
  );

  const allSplittedSubOrders = useMemo(
    () =>
      splitSubOrders(
        subOrders,
        restaurantListingId,
        currentOrderVATPercentage,
        undefined,
        undefined,
      ),
    [currentOrderVATPercentage, restaurantListingId, subOrders],
  );

  const overviewInformation = useMemo(
    () => calculateOverviewInformation(splittedSubOrders),
    [splittedSubOrders],
  );
  const overviewData = {
    totalRevenue: overviewInformation.revenue,
    totalCustomer: overviewInformation.totalCustomers.length,
    totalOrders: overviewInformation.totalOrders,
  };

  const previousOverviewInformation = useMemo(
    () => calculateOverviewInformation(previousSplittedSubOrders),
    [previousSplittedSubOrders],
  );

  const previousOverviewData = {
    totalRevenue: previousOverviewInformation.revenue,
    totalCustomer: previousOverviewInformation.totalCustomers.length,
    totalOrders: previousOverviewInformation.totalOrders,
  };
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

  const analyticsRevenueChartData = useMemo(
    () =>
      formatChartData({
        subOrders: splittedSubOrders.filter(
          (item) => item.lastTransition === ETransition.COMPLETE_DELIVERY,
        ),
        timeFrame: analyticsRevenueTimeFrame,
        startDate: new Date(startDate!),
        endDate: new Date(endDate!),
      }),
    [analyticsRevenueTimeFrame, endDate, splittedSubOrders, startDate],
  );

  useEffect(() => {
    if (startDate && endDate) {
      dispatch(
        PartnerDashboardThunks.fetchSubOrders({
          currentSubOrderParams: {
            startDate: startDate - 7 * 24 * 60 * 60 * 1000,
            endDate: endDate + 7 * 24 * 60 * 60 * 1000,
          },
          previousSubOrdersParams: {
            startDate: previousStartDate! - 7 * 24 * 60 * 60 * 1000,
            endDate: previousEndDate! + 7 * 24 * 60 * 60 * 1000,
          },
        }),
      );
    }
  }, [dispatch, endDate, startDate]);

  useEffect(() => {
    if (
      timePeriodOption === ETimePeriodOption.TODAY ||
      timePeriodOption === ETimePeriodOption.YESTERDAY ||
      timePeriodOption === ETimePeriodOption.LAST_7_DAYS ||
      timePeriodOption === ETimePeriodOption.LAST_30_DAYS ||
      timePeriodOption === ETimePeriodOption.CUSTOM
    ) {
      setAnalyticsOrdersTimeFrame(ETimeFrame.DAY);
      setAnalyticsRevenueTimeFrame(ETimeFrame.DAY);
    } else if (timePeriodOption === ETimePeriodOption.LAST_WEEK) {
      setAnalyticsOrdersTimeFrame(ETimeFrame.WEEK);
      setAnalyticsRevenueTimeFrame(ETimeFrame.WEEK);
    } else {
      setAnalyticsOrdersTimeFrame(ETimeFrame.MONTH);
      setAnalyticsRevenueTimeFrame(ETimeFrame.MONTH);
    }
  }, [timePeriodOption]);

  return (
    <div className={css.root}>
      <section>
        <Overview
          data={overviewData}
          previousData={previousOverviewData}
          timePeriodOption={timePeriodOption}
          inProgress={fetchSubOrdersInProgress}
          handleTimePeriodChange={handleTimePeriodChange}
          startDate={startDate!}
          endDate={endDate!}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          resetTimePeriod={resetTimePeriod}
        />
      </section>
      <section>
        <OrdersAnalytics
          overviewData={overviewData}
          chartData={analyticsOrderChartData}
          inProgress={fetchSubOrdersInProgress}
          timePeriodOption={timePeriodOption}
        />
      </section>
      <section>
        <RevenueAnalytics
          overviewData={overviewData}
          chartData={analyticsRevenueChartData}
          inProgress={fetchSubOrdersInProgress}
          timePeriodOption={timePeriodOption}
        />
      </section>
      <section>
        <LatestOrders
          data={latestSplittedSubOrders.slice(0, 5)}
          inProgress={fetchSubOrdersInProgress}
        />
      </section>
      <section>
        <OrderCalendar
          data={allSplittedSubOrders}
          inProgress={fetchSubOrdersInProgress}
          startDate={startDate!}
          endDate={endDate!}
        />
      </section>
    </div>
  );
};

export default Dashboard;
