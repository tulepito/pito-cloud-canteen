import { useMemo } from 'react';
import { useIntl } from 'react-intl';

import Collapsible from '@components/Collapsible/Collapsible';
import { useAppSelector } from '@hooks/reduxHooks';
import { Listing } from '@src/utils/data';
import type { TListing } from '@src/utils/types';

import css from './TrackingOrderInfo.module.scss';

type TTrackingOrderInfoProps = {};

const TrackingOrderInfo: React.FC<TTrackingOrderInfoProps> = () => {
  const intl = useIntl();
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
  }, []);

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
              <div className={css.value}>{value}</div>
            </div>
          );
        })}
      </div>
    </Collapsible>
  );
};

export default TrackingOrderInfo;
