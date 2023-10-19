import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import Skeleton from 'react-loading-skeleton';

import Collapsible from '@components/Collapsible/Collapsible';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppSelector } from '@hooks/reduxHooks';
import { Listing } from '@src/utils/data';
import type { TListing } from '@src/utils/types';

import css from './TrackingOrderInfo.module.scss';

type TTrackingOrderInfoProps = {};

const TrackingOrderInfo: React.FC<TTrackingOrderInfoProps> = () => {
  const intl = useIntl();
  const loadDataInProgress = useAppSelector(
    (state) => state.TrackingPage.loadDataInProgress,
  );
  const order = useAppSelector((state) => state.TrackingPage.order);

  const { restaurant } = order || {};
  const restaurantGetter = Listing(restaurant as TListing);
  const { title: restaurantName } = restaurantGetter.getAttributes();
  const {
    contactorName = '',
    phoneNumber = '',
    location = {},
  } = restaurantGetter.getPublicData();

  const rowData = useMemo(() => {
    return [
      {
        label: intl.formatMessage({ id: 'Tracking.OrderInfo.partner' }),
        value: restaurantName,
      },
      {
        label: intl.formatMessage({ id: 'Tracking.OrderInfo.phoneNumber' }),
        value: phoneNumber,
      },
      {
        label: intl.formatMessage({ id: 'Tracking.OrderInfo.contactorName' }),
        value: contactorName,
      },
      {
        label: intl.formatMessage({ id: 'Tracking.OrderInfo.address' }),
        value: location?.address || '',
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantName, phoneNumber, contactorName, JSON.stringify(location)]);

  return (
    <Collapsible
      label={intl.formatMessage({
        id: 'Tracking.OrderInfo.title',
      })}>
      <div className={css.rows}>
        {rowData.map(({ label, value }, index) => {
          return (
            <div key={index} className={css.rowInfo}>
              <div className={css.label}>
                {index + 1}. {label}
              </div>
              <RenderWhen condition={loadDataInProgress}>
                <Skeleton key={index} className={css.rowDataLoading} />
                <RenderWhen.False>
                  <div className={css.value}>{value}</div>
                </RenderWhen.False>
              </RenderWhen>
            </div>
          );
        })}
      </div>
    </Collapsible>
  );
};

export default TrackingOrderInfo;
