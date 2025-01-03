/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import Skeleton from 'react-loading-skeleton';

import Collapsible from '@components/Collapsible/Collapsible';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppSelector } from '@hooks/reduxHooks';
import { Listing, User } from '@src/utils/data';
import { formatTimestamp } from '@src/utils/dates';
import { buildFullName } from '@src/utils/emailTemplate/participantOrderPicking';
import type { TListing, TUser } from '@src/utils/types';

import css from './TrackingDeliveryInfo.module.scss';

type TTrackingDeliveryInfoProps = { subOrderDate: number | string };

const TrackingDeliveryInfo: React.FC<TTrackingDeliveryInfoProps> = ({
  subOrderDate,
}) => {
  const intl = useIntl();
  const loadDataInProgress = useAppSelector(
    (state) => state.TrackingPage.loadDataInProgress,
  );
  const order = useAppSelector((state) => state.TrackingPage.order);

  const { booker } = order || {};
  // Booker data
  const bookerGetter = User(booker as TUser);
  const { firstName, lastName, displayName } = bookerGetter.getProfile();
  const { phoneNumber = '-' } = bookerGetter.getPublicData();
  // Order data
  const orderGetter = Listing(order as TListing);
  const {
    deliveryAddress = {},
    companyName = '-',
    deliveryHour,
  } = orderGetter.getMetadata();

  const rowData = useMemo(() => {
    return [
      {
        label: intl.formatMessage({ id: 'Tracking.DeliveryInfo.client' }),
        value: companyName,
      },
      {
        label: intl.formatMessage({ id: 'Tracking.DeliveryInfo.staff' }),
        value: buildFullName(firstName, lastName, {
          compareToGetLongerWith: displayName,
        }),
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
        value: deliveryAddress?.address || '-',
      },
      {
        label: intl.formatMessage({ id: 'Tracking.DeliveryInfo.deliveryTime' }),
        value: `${deliveryHour || '-'}, ${formatTimestamp(
          Number(subOrderDate),
        )}`,
      },
    ];
  }, [
    companyName,
    lastName,
    firstName,
    phoneNumber,
    deliveryHour,
    subOrderDate,
    JSON.stringify(deliveryAddress),
  ]);

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

export default TrackingDeliveryInfo;
