import LineChart from '@components/Chart/LineChart/LineChart';
import IconNoAnalyticsData from '@components/Icons/IconNoAnalyticsData/IconNoAnalyticsData';
import NamedLink from '@components/NamedLink/NamedLink';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useControlTimeFrame } from '@pages/partner/hooks/useControlTimeFrame';
import { partnerPaths } from '@src/paths';
import type { TChartPoint } from '@src/utils/types';

import TimeFrameSelector from '../TimeFrameSelector/TimeFrameSelector';

import css from './OrdersAnalytics.module.scss';

type TOrdersAnalyticsProps = {
  data: any[];
  inProgress?: boolean;
  overviewData: {
    totalRevenue: number;
    totalCustomer: number;
    totalOrders: number;
  };
  chartData: TChartPoint[];
};

const OrdersAnalytics: React.FC<TOrdersAnalyticsProps> = (props) => {
  const { data = [], inProgress, overviewData, chartData } = props;
  const { totalOrders } = overviewData;
  const { analyticsOrdersTimeFrame, setAnalyticsOrdersTimeFrame } =
    useControlTimeFrame();

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
                    // customTooltip={CustomizeTooltip}
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
