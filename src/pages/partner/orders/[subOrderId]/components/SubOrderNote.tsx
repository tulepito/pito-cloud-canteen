import { useIntl } from 'react-intl';
import Skeleton from 'react-loading-skeleton';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';

import Collapsible from '@components/Collapsible/Collapsible';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppSelector } from '@hooks/reduxHooks';
import { Listing } from '@src/utils/data';
import { EOrderType } from '@src/utils/enums';
import type { TListing } from '@src/utils/types';

import css from './SubOrderNote.module.scss';

type TSubOrderNoteProps = {};

const SubOrderNote: React.FC<TSubOrderNoteProps> = () => {
  const intl = useIntl();
  const router = useRouter();

  const order = useAppSelector((state) => state.PartnerSubOrderDetail.order);
  const fetchOrderInProgress = useAppSelector(
    (state) => state.PartnerSubOrderDetail.fetchOrderInProgress,
  );

  const {
    query: { subOrderId = '' },
  } = router;

  // eslint-disable-next-line no-unsafe-optional-chaining
  const [, date] = (subOrderId as string)?.split('_');

  const { plan } = order;
  const orderGetter = Listing(order as TListing);
  const planGetter = Listing(plan as TListing);

  const { orderType = EOrderType.group, orderNote: bookerOrderNote } =
    orderGetter.getMetadata();
  const { orderDetail = {} } = planGetter.getMetadata();
  const isGroupOrder = orderType === EOrderType.group;
  const { note: bookerSubOrderNote } = orderDetail[date] || {};

  const hasGroupOrderNote = isGroupOrder && !isEmpty(bookerOrderNote);
  const hasNormalOrderNote = !isGroupOrder && !isEmpty(bookerSubOrderNote);
  const hasSubOrderNote = hasGroupOrderNote || hasNormalOrderNote;

  return (
    <RenderWhen condition={!fetchOrderInProgress}>
      <div className={css.mobileNotesWrapper}>
        <RenderWhen condition={hasSubOrderNote}>
          <div className={css.title}>
            {intl.formatMessage({ id: 'SubOrderNote.title' })}R
          </div>
        </RenderWhen>
        <RenderWhen condition={hasGroupOrderNote}>
          <div className={css.note}>{bookerOrderNote}</div>
        </RenderWhen>
        <RenderWhen condition={hasNormalOrderNote}>
          <div className={css.note}>{bookerSubOrderNote}</div>
        </RenderWhen>
      </div>
      <div className={css.desktopNotesWrapper}>
        <RenderWhen condition={hasGroupOrderNote}>
          <Collapsible label={intl.formatMessage({ id: 'SubOrderNote.title' })}>
            <div className={css.note}>{bookerOrderNote}</div>
          </Collapsible>
        </RenderWhen>
        <RenderWhen condition={hasNormalOrderNote}>
          <Collapsible label={intl.formatMessage({ id: 'SubOrderNote.title' })}>
            <div className={css.note}>{bookerSubOrderNote}</div>
          </Collapsible>
        </RenderWhen>
      </div>
      <RenderWhen.False>
        <Skeleton className={css.loading} />
      </RenderWhen.False>
    </RenderWhen>
  );
};

export default SubOrderNote;
