import { useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import type { TooltipProps } from 'recharts';

import LineChart from '@components/Chart/LineChart/LineChart';
import IconNoAnalyticsData from '@components/Icons/IconNoAnalyticsData/IconNoAnalyticsData';
import NamedLink from '@components/NamedLink/NamedLink';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { calculateLCM, formatAxisTickValue } from '@helpers/chart';
import { parseThousandNumber } from '@helpers/format';
import { useControlTimeFrame } from '@pages/partner/hooks/useControlTimeFrame';
import { partnerPaths } from '@src/paths';
import type { ETimePeriodOption } from '@src/utils/enums';
import type { TChartPoint } from '@src/utils/types';

import TimeFrameSelector from '../TimeFrameSelector/TimeFrameSelector';

import css from './RevenueAnalytics.module.scss';

const MIN_OF_MAX_REVENUE_DOMAIN_RANGE = 5000000;

type TRevenueAnalyticsProps = {
  data: any[];
  inProgress?: boolean;
  overviewData: {
    totalRevenue: number;
    totalCustomer: number;
    totalOrders: number;
  };
  chartData: TChartPoint[];
  timePeriodOption: ETimePeriodOption;
};

const CustomizeTooltip = (props: TooltipProps<any, any>) => {
  const { payload = [] } = props;

  return (
    <div className={css.tooltipWrapper}>
      <div>{`${parseThousandNumber(payload?.[0]?.value)}đ`}</div>
      <div>{payload[0]?.payload?.dateLabel}</div>
    </div>
  );
};

const RevenueAnalytics: React.FC<TRevenueAnalyticsProps> = (props) => {
  const {
    data = [],
    overviewData,
    chartData,
    inProgress,
    timePeriodOption,
  } = props;

  const { totalRevenue } = overviewData;
  const { analyticsRevenueTimeFrame, setAnalyticsRevenueTimeFrame } =
    useControlTimeFrame();

  const formattedTotalRevenue = `${parseThousandNumber(totalRevenue)}đ`;

  const lcmOfMaxRevenueAnd50k = useMemo(
    () =>
      calculateLCM(Math.max(...chartData.map((item) => item.revenue)), 50000),
    [chartData],
  );

  const domainRange = [
    0,
    lcmOfMaxRevenueAnd50k > MIN_OF_MAX_REVENUE_DOMAIN_RANGE
      ? lcmOfMaxRevenueAnd50k
      : MIN_OF_MAX_REVENUE_DOMAIN_RANGE,
  ];

  return (
    <div className={css.root}>
      <div className={css.titleHeader}>
        <div>Thống kê doanh thu</div>
        <NamedLink path={partnerPaths.ManageOrders} className={css.link}>
          Xem chi tiết
        </NamedLink>
      </div>
      <div className={css.dataWrapper}>
        <RenderWhen condition={!inProgress}>
          <RenderWhen condition={data.length === 0}>
            <div className={css.empty}>
              <IconNoAnalyticsData />
              <div className={css.emptyText}>
                Chưa có dữ liệu báo cáo trong thời gian này
              </div>
            </div>
            <RenderWhen.False>
              <div className={css.content}>
                <div className={css.timeFrameWrapper}>
                  <div className={css.title}>Thống kê doanh thu</div>
                  <TimeFrameSelector
                    timePeriodOption={timePeriodOption}
                    timeFrame={analyticsRevenueTimeFrame}
                    setTimeFrame={setAnalyticsRevenueTimeFrame}
                  />
                </div>
                <div className={css.totalSubOrdersWrapper}>
                  <div className={css.label}>Tổng doanh thu</div>
                  <div className={css.value}>{formattedTotalRevenue}</div>
                </div>
                <div className={css.chartWrapper}>
                  <LineChart
                    data={chartData}
                    dataKey="revenue"
                    customTooltip={CustomizeTooltip}
                    onYAxisTickFormattingFc={formatAxisTickValue}
                    domainRange={domainRange}
                  />
                </div>
              </div>
            </RenderWhen.False>
          </RenderWhen>
          <RenderWhen.False>
            <Skeleton className={css.loading} />
          </RenderWhen.False>
        </RenderWhen>
      </div>
    </div>
  );
};

export default RevenueAnalytics;
