import { useAppSelector } from '@hooks/reduxHooks';
import { Listing } from '@src/utils/data';
import type { TListing } from '@src/utils/types';

import { LineItemsTableComponent } from './LineItemsTableComponent';

import css from './LineItemsTable.module.scss';

type TLineItemsTableProps = {
  currentViewDate: number;
};

const LineItemsTable: React.FC<TLineItemsTableProps> = (props) => {
  const { currentViewDate } = props;
  const { planData } = useAppSelector((state) => state.OrderManagement);

  const { orderDetail = {} } = Listing(planData as TListing).getMetadata();
  const data = orderDetail[currentViewDate];

  return (
    <div className={css.root}>
      <LineItemsTableComponent
        data={data}
        onClickDeleteLineItem={() => () => {}}
      />
    </div>
  );
};

export default LineItemsTable;
