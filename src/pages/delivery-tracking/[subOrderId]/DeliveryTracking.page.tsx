import { useEffect } from 'react';
import { useRouter } from 'next/router';

import { useAppDispatch } from '@hooks/reduxHooks';

import { DeliveryTrackingPageThunks } from './DeliveryTrackingPage.slice';

import css from './DeliveryTrackingPage.module.scss';

type TDeliveryTrackingPageProps = {};

const DeliveryTrackingPage: React.FC<TDeliveryTrackingPageProps> = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    query: { subOrderId = '' },
  } = router;

  // eslint-disable-next-line no-unsafe-optional-chaining
  const [orderId, date] = (subOrderId as string)?.split('_');

  useEffect(() => {
    dispatch(
      DeliveryTrackingPageThunks.loadData({
        orderId,
        date,
      }),
    );
  }, []);

  return <div className={css.root}></div>;
};

export default DeliveryTrackingPage;
