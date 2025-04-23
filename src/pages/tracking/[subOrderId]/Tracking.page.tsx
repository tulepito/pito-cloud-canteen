import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';

import BasicHeader from '@components/BasicHeader/BasicHeader';
import { useAppSelector } from '@hooks/reduxHooks';
import { Listing } from '@src/utils/data';
import type { TListing } from '@src/utils/types';

import TrackingOrderInfo from './components/TrackingOrderInfo';

import css from './TrackingPage.module.scss';

type TTrackingPageProps = {};

const TrackingPage: React.FC<TTrackingPageProps> = () => {
  const intl = useIntl();
  const router = useRouter();

  const order = useAppSelector((state) => state.TrackingPage.order);

  const {
    query: { subOrderId = '' },
  } = router;

  // eslint-disable-next-line unused-imports/no-unused-vars
  const [_orderId, date] = (String(subOrderId) || '').split('_');
  const dateIndex = new Date(Number(date)).getDay();
  const { title: orderTitle = '' } = Listing(order as TListing).getAttributes();

  if (!subOrderId) return null;

  return (
    <div className={css.root}>
      <BasicHeader />

      <div className={css.titleContainer}>
        <div className={css.title}>
          {intl.formatMessage({ id: 'TrackingPage.title' })}
        </div>
        {`#${orderTitle}_${dateIndex}`}
      </div>

      <TrackingOrderInfo subOrderDate={date} />
      <div className="h-[100px]"></div>
    </div>
  );
};

export default TrackingPage;
