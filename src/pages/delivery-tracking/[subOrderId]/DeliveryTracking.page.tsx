import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import Skeleton from 'react-loading-skeleton';
import { useRouter } from 'next/router';

import BasicHeader from '@components/BasicHeader/BasicHeader';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';

import { DeliveryTrackingPageThunks } from './DeliveryTrackingPage.slice';

import css from './DeliveryTrackingPage.module.scss';

type TDeliveryTrackingPageProps = {};

const DeliveryTrackingPage: React.FC<TDeliveryTrackingPageProps> = () => {
  const intl = useIntl();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const loadDataInProgress = useAppSelector(
    (state) => state.DeliveryTrackingPage.loadDataInProgress,
  );

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

  return (
    <div className={css.root}>
      <BasicHeader />

      <div className={css.titleContainer}>
        <div className={css.title}>
          {intl.formatMessage({ id: 'DeliveryTrackingPage.title' })}
        </div>
        <RenderWhen condition={loadDataInProgress}>
          <Skeleton className={css.subTitleLoading} />

          <RenderWhen.False>
            <div>
              {intl.formatMessage(
                { id: 'DeliveryTrackingPage.subTitle' },
                { orderTitle: '' },
              )}
            </div>
          </RenderWhen.False>
        </RenderWhen>
      </div>

      <div></div>
    </div>
  );
};

export default DeliveryTrackingPage;
