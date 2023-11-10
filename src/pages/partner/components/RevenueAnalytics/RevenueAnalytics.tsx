import type { TooltipProps } from 'recharts';

import LineChart from '@components/Chart/LineChart/LineChart';
import IconNoAnalyticsData from '@components/Icons/IconNoAnalyticsData/IconNoAnalyticsData';
import NamedLink from '@components/NamedLink/NamedLink';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useControlTimeFrame } from '@pages/partner/hooks/useControlTimeFrame';
import { partnerPaths } from '@src/paths';
import type { ETimePeriodOption } from '@src/utils/enums';
import type { TChartPoint } from '@src/utils/types';

import TimeFrameSelector from '../TimeFrameSelector/TimeFrameSelector';

import css from './RevenueAnalytics.module.scss';

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
      <div>{`${payload[0]?.value} đơn hàng`}</div>
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
                  <TimeFrameSelector
                    timePeriodOption={timePeriodOption}
                    timeFrame={analyticsRevenueTimeFrame}
                    setTimeFrame={setAnalyticsRevenueTimeFrame}
                  />
                </div>
                <div className={css.totalSubOrdersWrapper}>
                  <div className={css.label}>Tổng doanh thu</div>
                  <div className={css.value}>{totalRevenue}</div>
                </div>
                <div className={css.chartWrapper}>
                  <LineChart
                    data={chartData}
                    dataKey="revenue"
                    customTooltip={CustomizeTooltip}
                  />
                </div>
              </div>
            </RenderWhen.False>
          </RenderWhen>
        </RenderWhen>
      </div>
    </div>
  );
};

export default RevenueAnalytics;
