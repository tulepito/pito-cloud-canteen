import { useIntl } from 'react-intl';
import Skeleton from 'react-loading-skeleton';
import { useRouter } from 'next/router';

import RenderWhen from '@components/RenderWhen/RenderWhen';
import SubOrderBadge from '@components/SubOrderBadge/SubOrderBadge';
import { useAppSelector } from '@hooks/reduxHooks';
import { Listing, Transaction } from '@src/utils/data';
import type { TListing } from '@src/utils/types';

import css from './SubOrderTitle.module.scss';

type TSubOrderTitleProps = {};

const SubOrderTitle: React.FC<TSubOrderTitleProps> = () => {
  const intl = useIntl();
  const router = useRouter();
  const order = useAppSelector((state) => state.PartnerSubOrderDetail.order);
  const transaction = useAppSelector(
    (state) => state.PartnerSubOrderDetail.transaction,
  );
  const fetchOrderInProgress = useAppSelector(
    (state) => state.PartnerSubOrderDetail.fetchOrderInProgress,
  );

  const {
    query: { subOrderId = '' },
  } = router;

  // eslint-disable-next-line no-unsafe-optional-chaining
  const [, date] = (subOrderId as string)?.split('_');
  const dayIndex = new Date(Number(date)).getDay();
  const { title: orderTitle = '' } = Listing(order as TListing).getAttributes();
  const { lastTransition } = Transaction(transaction!).getAttributes();

  return (
    <RenderWhen condition={!fetchOrderInProgress}>
      <div className={css.root}>
        <div className={css.mainTitle}>
          <div>
            {intl.formatMessage(
              { id: 'SubOrderTitle.mainTitle' },
              {
                orderTitle: (
                  <span className={css.orderTitle}>
                    #{orderTitle}-{dayIndex === 0 ? 7 : dayIndex}
                  </span>
                ),
              },
            )}
          </div>

          <SubOrderBadge lastTransition={lastTransition} />
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
