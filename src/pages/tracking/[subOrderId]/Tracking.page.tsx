import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import Skeleton from 'react-loading-skeleton';
import { useRouter } from 'next/router';

import BasicHeader from '@components/BasicHeader/BasicHeader';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { Listing } from '@src/utils/data';
import type { TListing } from '@src/utils/types';

import TrackingDeliveryInfo from './components/TrackingDeliveryInfo';
import TrackingOrderInfo from './components/TrackingOrderInfo';
import { TrackingPageThunks } from './TrackingPage.slice';

import css from './TrackingPage.module.scss';

type TTrackingPageProps = {};

const TrackingPage: React.FC<TTrackingPageProps> = () => {
  const intl = useIntl();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const loadDataInProgress = useAppSelector(
    (state) => state.TrackingPage.loadDataInProgress,
  );
  const order = useAppSelector((state) => state.TrackingPage.order);

  const {
    query: { subOrderId = '' },
  } = router;

  // eslint-disable-next-line no-unsafe-optional-chaining
  const [orderId, date] = (subOrderId as string)?.split('_');

  const { orderTitle = '' } = Listing(order as TListing).getMetadata();

  useEffect(() => {
    if (orderId && date) {
      dispatch(
        TrackingPageThunks.loadData({
          orderId,
          date,
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, date]);

  return (
    <div className={css.root}>
      <BasicHeader />

      <div className={css.titleContainer}>
        <div className={css.title}>
          {intl.formatMessage({ id: 'TrackingPage.title' })}
        </div>
        <RenderWhen condition={loadDataInProgress}>
          <Skeleton className={css.subTitleLoading} />

          <RenderWhen.False>
            <div>
              {intl.formatMessage(
                { id: 'TrackingPage.subTitle' },
                { orderTitle },
              )}
            </div>
          </RenderWhen.False>
        </RenderWhen>
      </div>

      <TrackingOrderInfo />
      <TrackingDeliveryInfo subOrderDate={date} />

      <div></div>
    </div>
  );
};

export default TrackingPage;
