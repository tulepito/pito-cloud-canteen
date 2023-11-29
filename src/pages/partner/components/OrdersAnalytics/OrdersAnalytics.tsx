import Skeleton from 'react-loading-skeleton';
import type { TooltipProps } from 'recharts';

import LineChart from '@components/Chart/LineChart/LineChart';
import IconNoAnalyticsData from '@components/Icons/IconNoAnalyticsData/IconNoAnalyticsData';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import {
  formatPartnerOrderTooltipLabel,
  formatPartnerOrderXAxisTickValue,
} from '@helpers/chart';
import { useViewport } from '@hooks/useViewport';
import { useControlTimeFrame } from '@pages/partner/hooks/useControlTimeFrame';
import type { ETimeFrame } from '@src/utils/enums';
import { type ETimePeriodOption } from '@src/utils/enums';
import type { TChartPoint } from '@src/utils/types';

import TimeFrameSelector from '../TimeFrameSelector/TimeFrameSelector';

import css from './OrdersAnalytics.module.scss';

const MIN_OF_MAX_ORDERS_DOMAIN_RANGE = 60;

type TOrdersAnalyticsProps = {
  inProgress?: boolean;
  overviewData: {
    totalRevenue: number;
    totalCustomer: number;
    totalOrders: number;
  };
  chartData: TChartPoint[];
  timePeriodOption: ETimePeriodOption;
};

const CustomizeTooltip = (
  props: TooltipProps<any, any> & { timeFrame: ETimeFrame },
) => {
  const { payload = [], timeFrame } = props;
  const dateValue = payload?.[0]?.payload?.dateLabel;

  return (
    <div className={css.tooltipWrapper}>
      <div>{`${payload?.[0]?.value} đơn hàng`}</div>
      <div>{formatPartnerOrderTooltipLabel(dateValue, timeFrame)}</div>
    </div>
  );
};

const OrdersAnalytics: React.FC<TOrdersAnalyticsProps> = (props) => {
  const { inProgress, overviewData, chartData, timePeriodOption } = props;
  const { totalOrders } = overviewData;
  const { analyticsOrdersTimeFrame, setAnalyticsOrdersTimeFrame } =
    useControlTimeFrame();
  const { isMobileLayout } = useViewport();

  const maxOrderValue = Math.max(...chartData.map((item) => item.orders));

  const domainRange = [
    0,
    maxOrderValue > MIN_OF_MAX_ORDERS_DOMAIN_RANGE
      ? maxOrderValue + 5 - (maxOrderValue % 5)
      : MIN_OF_MAX_ORDERS_DOMAIN_RANGE,
  ];

  const formatXAxisTick = (value: number) => {
    return formatPartnerOrderXAxisTickValue(value, analyticsOrdersTimeFrame);
  };

  return (
    <div className={css.root}>
      <div className={css.titleHeader}>
        <div>Thống kê đơn hàng</div>
      </div>
      <div className={css.dataWrapper}>
        <RenderWhen condition={!inProgress}>
          <RenderWhen condition={chartData.length === 0}>
            <div className={css.empty}>
              <IconNoAnalyticsData />
              <div className={css.emptyText}>
                Chưa có dữ liệu báo cáo trong thời gian này
              </div>
            </div>
            <RenderWhen.False>
              <div className={css.content}>
                <div className={css.timeFrameWrapper}>
                  <div className={css.title}>Thống kê đơn hàng</div>
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
                    customTooltip={(_props) => (
                      <CustomizeTooltip
                        {..._props}
                        timeFrame={analyticsOrdersTimeFrame}
                      />
                    )}
                    domainRange={domainRange}
                    isMobile={isMobileLayout}
                    onXAxisTickFormattingFn={formatXAxisTick}
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

export default OrdersAnalytics;
