import { useMemo } from 'react';
import type { TooltipProps } from 'recharts';

import LineChart from '@components/Chart/LineChart/LineChart';
import IconNoAnalyticsData from '@components/Icons/IconNoAnalyticsData/IconNoAnalyticsData';
import NamedLink from '@components/NamedLink/NamedLink';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { calculateLCM } from '@helpers/chart';
import { useControlTimeFrame } from '@pages/partner/hooks/useControlTimeFrame';
import { partnerPaths } from '@src/paths';
import type { ETimePeriodOption } from '@src/utils/enums';
import type { TChartPoint } from '@src/utils/types';

import TimeFrameSelector from '../TimeFrameSelector/TimeFrameSelector';

import css from './OrdersAnalytics.module.scss';

const MIN_OF_MAX_ORDERS_DOMAIN_RANGE = 60;

type TOrdersAnalyticsProps = {
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

const OrdersAnalytics: React.FC<TOrdersAnalyticsProps> = (props) => {
  const {
    data = [],
    inProgress,
    overviewData,
    chartData,
    timePeriodOption,
  } = props;
  const { totalOrders } = overviewData;
  const { analyticsOrdersTimeFrame, setAnalyticsOrdersTimeFrame } =
    useControlTimeFrame();

  const lcmOfMaxOrdersAnd15 = useMemo(
    () => calculateLCM(Math.max(...chartData.map((item) => item.orders)), 15),
    [chartData],
  );

  const domainRange = [
    0,
    lcmOfMaxOrdersAnd15 > MIN_OF_MAX_ORDERS_DOMAIN_RANGE
      ? lcmOfMaxOrdersAnd15
      : MIN_OF_MAX_ORDERS_DOMAIN_RANGE,
  ];

  return (
    <div className={css.root}>
      <div className={css.titleHeader}>
        <div>Thống kê đơn hàng</div>
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
                    timeFrame={analyticsOrdersTimeFrame}
                    setTimeFrame={setAnalyticsOrdersTimeFrame}
                  />
                </div>
                <div className={css.totalSubOrdersWrapper}>
                  <div className={css.label}>Tổng đơn</div>
                  <div className={css.value}>{totalOrders}</div>
                </div>
                <div className={css.chartWrapper}>
                  <LineChart
                    data={chartData}
                    dataKey="orders"
                    customTooltip={CustomizeTooltip}
                    domainRange={domainRange}
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

export default OrdersAnalytics;
