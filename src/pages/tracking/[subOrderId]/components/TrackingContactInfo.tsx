import { useMemo } from 'react';
import { useIntl } from 'react-intl';

import Collapsible from '@components/Collapsible/Collapsible';
import { useAppSelector } from '@hooks/reduxHooks';
import { Listing } from '@src/utils/data';
import type { TListing } from '@src/utils/types';

import css from './TrackingContactInfo.module.scss';

type TTrackingContactInfoProps = {};

const TrackingContactInfo: React.FC<TTrackingContactInfoProps> = () => {
  const intl = useIntl();
  const order = useAppSelector((state) => state.TrackingPage.order);

  const orderGetter = Listing(order as TListing);
  const { staffName = '-' } = orderGetter.getMetadata();

  const rowData = useMemo(() => {
    return [
      {
        label: intl.formatMessage({
          id: 'Tracking.ContactInfo.deliveryManName',
        }),
        value: staffName,
      },
      {
        label: intl.formatMessage({
          id: 'Tracking.ContactInfo.deliveryManPhoneNumber',
        }),
        value: '-',
      },
    ];
  }, []);

  return (
    <Collapsible
      label={intl.formatMessage({
        id: 'Tracking.ContactInfo.title',
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

export default TrackingContactInfo;
