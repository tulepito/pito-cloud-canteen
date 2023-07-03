import { useEffect } from 'react';
import { useRouter } from 'next/router';

import { useAppDispatch } from '@hooks/reduxHooks';
import { orderManagementThunks } from '@redux/slices/OrderManagement.slice';

import SubOrderCart from './components/SubOrderCart';
import SubOrderInfo from './components/SubOrderInfo';
import SubOrderNote from './components/SubOrderNote';
import SubOrderSummary from './components/SubOrderSummary';
import SubOrderTitle from './components/SubOrderTitle';
import { PartnerSubOrderDetailThunks } from './PartnerSubOrderDetail.slice';

import css from './PartnerSubOrderDetailPage.module.scss';

type TPartnerSubOrderDetailPageProps = {};

const PartnerSubOrderDetailPage: React.FC<
  TPartnerSubOrderDetailPageProps
> = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    query: { subOrderId },
    isReady,
  } = router;

  useEffect(() => {
    if (subOrderId && isReady) {
      // eslint-disable-next-line no-unsafe-optional-chaining
      const [orderId, date] = (subOrderId as string)?.split('_');

      dispatch(PartnerSubOrderDetailThunks.loadData({ orderId, date }));
      dispatch(orderManagementThunks.loadData(orderId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, subOrderId]);

  return (
    <div className={css.root}>
      <SubOrderTitle />
      <div className={css.container}>
        <div className={css.leftPart}>
          <SubOrderInfo />
          <SubOrderSummary />
          <SubOrderNote />
        </div>
        <div className={css.rightPart}>
          <SubOrderCart />
        </div>
      </div>
    </div>
  );
};

export default PartnerSubOrderDetailPage;
