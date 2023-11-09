import IconNoAnalyticsData from '@components/Icons/IconNoAnalyticsData/IconNoAnalyticsData';
import NamedLink from '@components/NamedLink/NamedLink';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { partnerPaths } from '@src/paths';

import SubOrderItem from './SubOrderItem/SubOrderItem';

import css from './LatestOrders.module.scss';

type TLatestOrdersProps = {
  data: any[];
};

const LatestOrders: React.FC<TLatestOrdersProps> = (props) => {
  const { data = [] } = props;

  return (
    <div className={css.root}>
      <div className={css.titleHeader}>
        <div>Đơn hàng gần nhất</div>
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
          <RenderWhen.False>
            {data.map((item: any) => (
              <SubOrderItem key={item.subOrderId} subOrder={item} />
            ))}
          </RenderWhen.False>
        </RenderWhen>
      </div>
    </div>
  );
};

export default LatestOrders;
