import { useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';

import IconNoAnalyticsData from '@components/Icons/IconNoAnalyticsData/IconNoAnalyticsData';
import NamedLink from '@components/NamedLink/NamedLink';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import SubOrderBadge from '@components/SubOrderBadge/SubOrderBadge';
import type { TColumn } from '@components/Table/Table';
import Table from '@components/Table/Table';
import { parseThousandNumber } from '@helpers/format';
import { partnerPaths } from '@src/paths';
import { formatTimestamp } from '@src/utils/dates';

import SubOrderItem from './SubOrderItem/SubOrderItem';

import css from './LatestOrders.module.scss';

type TLatestOrdersProps = {
  data: any[];
  inProgress?: boolean;
};

const TABLE_COLUMN: TColumn[] = [
  {
    key: 'title',
    label: 'ID',
    render: ({ subOrderTitle, subOrderId }: any) => (
      <NamedLink
        className={css.subOrderTitle}
        path={partnerPaths.SubOrderDetail.replace(
          '[subOrderId]',
          subOrderId,
        )}>{`#${subOrderTitle}`}</NamedLink>
    ),
  },
  {
    key: 'time',
    label: 'Thời gian',
    render: ({ subOrderDate, deliveryHour }: any) => {
      return (
        <>
          <div className={css.boldText}>{deliveryHour}</div>
          <div>{formatTimestamp(subOrderDate)}</div>
        </>
      );
    },
  },
  {
    key: 'customer',
    label: 'Khách hàng',
    render: ({ companyName }: any) => {
      return <div className={css.boldText}>{companyName}</div>;
    },
  },
  {
    key: 'revenue',
    label: 'Doanh thu',
    render: ({ revenue }: any) => {
      return (
        <div className={css.boldText}>{`${parseThousandNumber(revenue)}đ`}</div>
      );
    },
  },
  {
    key: 'totalDishes',
    label: 'SL đặt',
    render: ({ totalDishes }: any) => {
      return <div className={css.boldText}>{totalDishes}</div>;
    },
  },
  {
    key: 'status',
    label: 'Trạng thái',
    render: ({ lastTransition }: any) => {
      return <SubOrderBadge lastTransition={lastTransition} />;
    },
  },
];

const LatestOrders: React.FC<TLatestOrdersProps> = (props) => {
  const { data = [], inProgress } = props;

  const sortedData = useMemo(
    () => data.sort((a, b) => b.subOrderDate - a.subOrderDate),
    [data],
  );

  const tableData = useMemo(
    () =>
      sortedData.map((item) => ({
        key: item.subOrderId,
        data: {
          subOrderId: item.subOrderId,
          subOrderTitle: item.subOrderTitle,
          subOrderDate: item.subOrderDate,
          deliveryHour: item.deliveryHour,
          companyName: item.companyName,
          revenue: item.revenue,
          totalDishes: item.totalDishes,
          lastTransition: item.lastTransition,
        },
      })),
    [sortedData],
  );

  return (
    <div className={css.root}>
      <div className={css.titleHeader}>
        <div className={css.title}>Đơn hàng gần nhất</div>
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
              <div className={css.mobileWrapper}>
                {data.map((item: any) => (
                  <SubOrderItem key={item.subOrderId} subOrder={item} />
                ))}
              </div>
              <div className={css.desktopWrapper}>
                <Table columns={TABLE_COLUMN} data={tableData} />
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

export default LatestOrders;
