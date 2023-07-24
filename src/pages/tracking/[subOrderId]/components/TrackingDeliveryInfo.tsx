import { useMemo } from 'react';
import { useIntl } from 'react-intl';

import Collapsible from '@components/Collapsible/Collapsible';
import { useAppSelector } from '@hooks/reduxHooks';
import { Listing, User } from '@src/utils/data';
import { formatTimestamp } from '@src/utils/dates';
import type { TListing, TUser } from '@src/utils/types';

import css from './TrackingDeliveryInfo.module.scss';

type TTrackingDeliveryInfoProps = { subOrderDate: number | string };

const TrackingDeliveryInfo: React.FC<TTrackingDeliveryInfoProps> = ({
  subOrderDate,
}) => {
  const intl = useIntl();
  const order = useAppSelector((state) => state.TrackingPage.order);

  const { booker } = order || {};
  // Booker data
  const bookerGetter = User(booker as TUser);
  const { firstName, lastName } = bookerGetter.getProfile();
  const { phoneNumber } = bookerGetter.getPublicData();
  // Order data
  const orderGetter = Listing(order as TListing);
  const {
    deliveryAddress = {},
    companyName = '',
    deadlineHour,
  } = orderGetter.getMetadata();

  const rowData = useMemo(() => {
    return [
      {
        label: intl.formatMessage({ id: 'Tracking.DeliveryInfo.client' }),
        value: companyName,
      },
      {
        label: intl.formatMessage({ id: 'Tracking.DeliveryInfo.staff' }),
        value: `${lastName} ${firstName}`,
      },
      {
        label: intl.formatMessage({
          id: 'Tracking.DeliveryInfo.phoneNumber',
        }),
        value: phoneNumber,
      },
      {
        label: intl.formatMessage({
          id: 'Tracking.DeliveryInfo.deliveryAddress',
        }),
        value: deliveryAddress?.address || '',
      },
      {
        label: intl.formatMessage({ id: 'Tracking.DeliveryInfo.deliveryTime' }),
        value: `${deadlineHour}, ${formatTimestamp(Number(subOrderDate))}`,
      },
    ];
  }, []);

  return (
    <Collapsible
      label={intl.formatMessage({
        id: 'Tracking.DeliveryInfo.title',
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

export default TrackingDeliveryInfo;
