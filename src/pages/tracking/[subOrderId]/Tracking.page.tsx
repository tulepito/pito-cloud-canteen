import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import Skeleton from 'react-loading-skeleton';
import { useRouter } from 'next/router';

import BasicHeader from '@components/BasicHeader/BasicHeader';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';

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

  const {
    query: { subOrderId = '' },
  } = router;

  // eslint-disable-next-line no-unsafe-optional-chaining
  const [orderId, date] = (subOrderId as string)?.split('_');

  useEffect(() => {
    dispatch(
      TrackingPageThunks.loadData({
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
          {intl.formatMessage({ id: 'TrackingPage.title' })}
        </div>
        <RenderWhen condition={loadDataInProgress}>
          <Skeleton className={css.subTitleLoading} />

          <RenderWhen.False>
            <div>
              {intl.formatMessage(
                { id: 'TrackingPage.subTitle' },
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

export default TrackingPage;
