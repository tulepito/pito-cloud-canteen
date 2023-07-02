import { useIntl } from 'react-intl';
import Skeleton from 'react-loading-skeleton';

import RenderWhen from '@components/RenderWhen/RenderWhen';
import SubOrderBadge from '@components/SubOrderBadge/SubOrderBadge';
import { useAppSelector } from '@hooks/reduxHooks';
import { Listing } from '@src/utils/data';
import type { TListing } from '@src/utils/types';

import css from './SubOrderTitle.module.scss';

type TSubOrderTitleProps = {};

const SubOrderTitle: React.FC<TSubOrderTitleProps> = () => {
  const intl = useIntl();
  const order = useAppSelector((state) => state.PartnerSubOrderDetail.order);
  const fetchOrderInProgress = useAppSelector(
    (state) => state.PartnerSubOrderDetail.fetchOrderInProgress,
  );

  const { transaction } = order || {};
  const orderGetter = Listing(order as TListing);

  const { title: orderTitle = '' } = orderGetter.getAttributes();

  return (
    <RenderWhen condition={!fetchOrderInProgress}>
      <div className={css.root}>
        <div className={css.mainTitle}>
          {intl.formatMessage(
            { id: 'SubOrderTitle.mainTitle' },
            {
              orderTitle: <span className={css.orderTitle}>#{orderTitle}</span>,
            },
          )}

          <SubOrderBadge transaction={transaction} />
        </div>
        <div className={css.note}>
          {intl.formatMessage(
            { id: 'SubOrderTitle.note' },
            {
              phoneNumber: (
                <span className={css.phoneNumber}>
                  {intl.formatMessage({ id: 'SubOrderTitle.phoneNumber' })}
                </span>
              ),
              chatLink: (
                <span className={css.chatLink}>
                  {intl.formatMessage({ id: 'SubOrderTitle.chatLink' })}
                </span>
              ),
            },
          )}
        </div>
      </div>
      <RenderWhen.False>
        <Skeleton className={css.loading} />
      </RenderWhen.False>
    </RenderWhen>
  );
};

export default SubOrderTitle;
