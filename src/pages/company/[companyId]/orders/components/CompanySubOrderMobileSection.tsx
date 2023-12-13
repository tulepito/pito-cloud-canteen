import Skeleton from 'react-loading-skeleton';

import RenderWhen from '@components/RenderWhen/RenderWhen';
import type { TRowData } from '@components/Table/Table';
import { useAppSelector } from '@hooks/reduxHooks';
import EmptySubOrder from '@pages/participant/orders/components/EmptySubOrder/EmptySubOrder';

import CompanySubOrderCard from './CompanySubOrderCard/CompanySubOrderCard';

import css from './CompanyOrdersTable.module.scss';

export function CompanySubOrderMobileSection({
  tableData,
}: {
  tableData: TRowData[];
}) {
  const { queryMoreOrderInProgress } = useAppSelector((state) => state.Order);

  return (
    <div className={css.subOrderCardList}>
      <RenderWhen condition={tableData.length > 0}>
        {tableData.map((subOrder: any) => (
          <CompanySubOrderCard key={subOrder.id} {...subOrder} />
        ))}

        <RenderWhen.False>
          <div className={css.empty}>
            <EmptySubOrder title="Bạn chưa có đơn hàng nào" />
          </div>
        </RenderWhen.False>

        <RenderWhen condition={queryMoreOrderInProgress}>
          <Skeleton height={200} />
        </RenderWhen>
      </RenderWhen>
    </div>
  );
}
