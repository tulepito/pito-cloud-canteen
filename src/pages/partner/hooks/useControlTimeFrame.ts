import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { ETimeFrame } from '@src/utils/enums';

import { PartnerDashboardActions } from '../Dashboard.slice';

export const timeFrameOptions = [
  { key: ETimeFrame.MONTH, label: 'Tháng' },
  { key: ETimeFrame.WEEK, label: 'Tuần' },
  { key: ETimeFrame.DAY, label: 'Ngày' },
];

export const useControlTimeFrame = () => {
  const analyticsRevenueTimeFrame = useAppSelector(
    (state) => state.PartnerDashboard.analyticsRevenueTimeFrame,
  );
  const analyticsOrdersTimeFrame = useAppSelector(
    (state) => state.PartnerDashboard.analyticsOrdersTimeFrame,
  );
  const dispatch = useAppDispatch();

  const setAnalyticsOrdersTimeFrame = (_timeFrame: ETimeFrame) => {
    dispatch(PartnerDashboardActions.setAnalyticsOrdersTimeFrame(_timeFrame));
  };

  const setAnalyticsRevenueTimeFrame = (_timeFrame: ETimeFrame) => {
    dispatch(PartnerDashboardActions.setAnalyticsRevenueTimeFrame(_timeFrame));
  };

  return {
    analyticsRevenueTimeFrame,
    analyticsOrdersTimeFrame,
    setAnalyticsOrdersTimeFrame,
    setAnalyticsRevenueTimeFrame,
  };
};
