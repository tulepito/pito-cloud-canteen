import { useIntl } from 'react-intl';
import Skeleton from 'react-loading-skeleton';
import { isEmpty } from 'lodash';

import Collapsible from '@components/Collapsible/Collapsible';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppSelector } from '@hooks/reduxHooks';
import { Listing } from '@src/utils/data';
import { EOrderType } from '@src/utils/enums';
import type { TListing } from '@src/utils/types';

import css from './TrackingOrderInfo.module.scss';

type TTrackingOrderInfoProps = {};

const TrackingNoteInfo: React.FC<TTrackingOrderInfoProps> = () => {
  const intl = useIntl();
  const order = useAppSelector((state) => state.TrackingPage.order);
  const loadDataInProgress = useAppSelector(
    (state) => state.TrackingPage.loadDataInProgress,
  );

  const { orderDetailOfDate } = order;
  const orderGetter = Listing(order as TListing);
  const { orderType = EOrderType.group, orderNote: bookerOrderNote } =
    orderGetter.getMetadata();
  const isGroupOrder = orderType === EOrderType.group;
  const { note: bookerSubOrderNote } = orderDetailOfDate || {};

  return (
    <Collapsible
      label={intl.formatMessage({
        id: 'Tracking.NoteInfo.title',
      })}>
      <div className={css.note}>
        <RenderWhen condition={!loadDataInProgress}>
          <RenderWhen condition={isGroupOrder && !isEmpty(bookerOrderNote)}>
            <>{bookerOrderNote}</>
          </RenderWhen>
          <RenderWhen condition={!isGroupOrder && !isEmpty(bookerSubOrderNote)}>
            <>{bookerSubOrderNote}</>
          </RenderWhen>
          <RenderWhen.False>
            <Skeleton className={css.loading} />
          </RenderWhen.False>
        </RenderWhen>
      </div>
    </Collapsible>
  );
};

export default TrackingNoteInfo;
