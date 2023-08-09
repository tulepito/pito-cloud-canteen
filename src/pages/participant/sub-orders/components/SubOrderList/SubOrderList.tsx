import RenderWhen from '@components/RenderWhen/RenderWhen';
import EmptySubOrder from '@pages/participant/orders/components/EmptySubOrder/EmptySubOrder';

import SubOrderCard from '../SubOrderCard/SubOrderCard';

import css from './SubOrderList.module.scss';

type SubOrderListProps = {
  subOrders: any;
  setSelectedSubOrder: (subOrder: any) => void;
  openSubOrderReviewModal: () => void;
  setSelectedEvent?: (event: any) => void;
  openRatingSubOrderModal?: () => void;
};

const SubOrderList: React.FC<SubOrderListProps> = (props) => {
  const {
    subOrders = [],
    setSelectedSubOrder,
    openSubOrderReviewModal,
    setSelectedEvent,
    openRatingSubOrderModal,
  } = props;

  return (
    <RenderWhen condition={subOrders.length === 0}>
      <div className={css.emptySubOrders}>
        <EmptySubOrder title="Hiện chưa có món ăn đang triển khai" />
      </div>
      <RenderWhen.False>
        <div className={css.subOrdersWrapper}>
          {subOrders.map((subOrder: any) => (
            <SubOrderCard
              key={subOrder.id}
              subOrder={subOrder}
              setSelectedSubOrder={setSelectedSubOrder}
              openSubOrderReviewModal={openSubOrderReviewModal}
              setSelectedEvent={setSelectedEvent}
              openRatingSubOrderModal={openRatingSubOrderModal}
            />
          ))}
        </div>
      </RenderWhen.False>
    </RenderWhen>
  );
};

export default SubOrderList;
