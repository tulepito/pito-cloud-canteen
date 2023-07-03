import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';

import { useAppSelector } from '@hooks/reduxHooks';
import { Listing, User } from '@src/utils/data';
import { findEndDeliveryTime, formatTimestamp } from '@src/utils/dates';
import type { TListing } from '@src/utils/types';

import css from './SubOrderInfo.module.scss';

type TSubOrderInfoProps = {};

const SubOrderInfo: React.FC<TSubOrderInfoProps> = () => {
  const intl = useIntl();
  const router = useRouter();
  const order = useAppSelector((state) => state.PartnerSubOrderDetail.order);

  const {
    query: { subOrderId },
  } = router;

  // eslint-disable-next-line no-unsafe-optional-chaining
  const [, date] = (subOrderId as string)?.split('_');

  const { company } = order || {};
  const companyGetter = User(company);
  const orderGetter = Listing(order as TListing);

  const {
    deliveryAddress = {},
    deliveryHour,
    staffName = '',
  } = orderGetter.getMetadata();
  const { companyName } = companyGetter.getPublicData();
  const formattedDeliveryHour = `${deliveryHour}-${findEndDeliveryTime(
    deliveryHour,
  )}, ${formatTimestamp(Number(date))}`;

  return (
    <div className={css.root}>
      <div className={css.title}>
        {intl.formatMessage({ id: 'SubOrderInfo.title' })}
      </div>
      <div className={css.row}>
        <div className={css.label}>
          {intl.formatMessage({ id: 'SubOrderInfo.companyLabel' })}
        </div>
        <div className={css.value}>{companyName}</div>
      </div>
      <div className={css.row}>
        <div className={css.label}>
          {intl.formatMessage({ id: 'SubOrderInfo.deliveryAddressLabel' })}
        </div>
        <div className={css.value}>{deliveryAddress?.address || ''}</div>
      </div>
      <div className={css.row}>
        <div className={css.label}>
          {intl.formatMessage({ id: 'SubOrderInfo.deliveryTimeLabel' })}
        </div>
        <div className={css.value}>{formattedDeliveryHour}</div>
      </div>
      <div className={css.row}>
        <div className={css.label}>
          {intl.formatMessage({ id: 'SubOrderInfo.staffNameLabel' })}
        </div>
        <div className={css.value}>{staffName}</div>
      </div>
    </div>
  );
};

export default SubOrderInfo;
