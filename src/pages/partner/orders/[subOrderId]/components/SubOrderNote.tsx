import { useIntl } from 'react-intl';
import Skeleton from 'react-loading-skeleton';
import isEmpty from 'lodash/isEmpty';

import Collapsible from '@components/Collapsible/Collapsible';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppSelector } from '@hooks/reduxHooks';
import { CurrentUser, Listing } from '@src/utils/data';
import type { TListing } from '@src/utils/types';

import css from './SubOrderNote.module.scss';

type TSubOrderNoteProps = {};

const SubOrderNote: React.FC<TSubOrderNoteProps> = () => {
  const intl = useIntl();
  const order = useAppSelector((state) => state.PartnerSubOrderDetail.order);
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const fetchOrderInProgress = useAppSelector(
    (state) => state.PartnerSubOrderDetail.fetchOrderInProgress,
  );

  const { restaurantListingId } = CurrentUser(currentUser!).getMetadata();
  const orderGetter = Listing(order as TListing);

  const { notes = {} } = orderGetter.getMetadata();
  const partnerNote = notes[restaurantListingId];

  return (
    <RenderWhen condition={!fetchOrderInProgress}>
      <RenderWhen condition={!isEmpty(partnerNote)}>
        <Collapsible label={intl.formatMessage({ id: 'SubOrderNote.title' })}>
          <div className={css.note}>{partnerNote}</div>
        </Collapsible>
      </RenderWhen>
      <RenderWhen.False>
        <Skeleton className={css.loading} />
      </RenderWhen.False>
    </RenderWhen>
  );
};

export default SubOrderNote;
