import SubOrderCard from '../SubOrderCard/SubOrderCard';

import css from './SubOrderList.module.scss';

type SubOrderListProps = {
  subOrders: any;
  setSelectedSubOrder: (subOrder: any) => void;
  openSubOrderReviewModal: () => void;
};

const SubOrderList: React.FC<SubOrderListProps> = (props) => {
  const { subOrders, setSelectedSubOrder, openSubOrderReviewModal } = props;

  return (
    <div className={css.subOrdersWrapper}>
      {subOrders.map((subOrder: any) => (
        <SubOrderCard
          key={subOrder.id}
          subOrder={subOrder}
          setSelectedSubOrder={setSelectedSubOrder}
          openSubOrderReviewModal={openSubOrderReviewModal}
        />
      ))}
    </div>
  );
};

export default SubOrderList;
