import IconNoAnalyticsData from '@components/Icons/IconNoAnalyticsData/IconNoAnalyticsData';
import NamedLink from '@components/NamedLink/NamedLink';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { partnerPaths } from '@src/paths';

import css from './OrdersAnalytics.module.scss';

type TOrdersAnalyticsProps = {
  data: any[];
};

const OrdersAnalytics: React.FC<TOrdersAnalyticsProps> = (props) => {
  const { data = [] } = props;

  return (
    <div className={css.root}>
      <div className={css.titleHeader}>
        <div>Thống kê đơn hàng</div>
        <NamedLink path={partnerPaths.ManageOrders} className={css.link}>
          Xem chi tiết
        </NamedLink>
      </div>
      <div className={css.dataWrapper}>
        <RenderWhen condition={data.length === 0}>
          <div className={css.empty}>
            <IconNoAnalyticsData />
            <div className={css.emptyText}>
              Chưa có dữ liệu báo cáo trong thời gian này
            </div>
          </div>
        </RenderWhen>
      </div>
    </div>
  );
};

export default OrdersAnalytics;
