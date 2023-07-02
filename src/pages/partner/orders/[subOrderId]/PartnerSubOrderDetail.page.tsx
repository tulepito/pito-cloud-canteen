import { useEffect } from 'react';
import { useRouter } from 'next/router';

import { useAppDispatch } from '@hooks/reduxHooks';

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
      const [orderId, date] = (subOrderId as string).split('_');

      dispatch(PartnerSubOrderDetailThunks.loadData({ orderId, date }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, subOrderId]);

  return (
    <div className={css.root}>
      <SubOrderTitle />
    </div>
  );
};

export default PartnerSubOrderDetailPage;
