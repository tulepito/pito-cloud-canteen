import { useEffect, useState } from 'react';
import type { Event } from 'react-big-calendar';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import { useRouter } from 'next/router';

import BottomNavigationBar from '@components/BottomNavigationBar/BottomNavigationBar';
import LoadingModal from '@components/LoadingModal/LoadingModal';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import Tabs from '@components/Tabs/Tabs';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { useBottomScroll } from '@hooks/useBottomScroll';
import { currentUserSelector } from '@redux/slices/user.slice';
import { CurrentUser } from '@src/utils/data';
import { ESubOrderTxStatus } from '@src/utils/enums';

import RatingSubOrderModal from '../orders/components/RatingSubOrderModal/RatingSubOrderModal';

import SubOrderList from './components/SubOrderList/SubOrderList';
import SubOrderReviewModal from './components/SubOrderReviewModal/SubOrderReviewModal';
import { SubOrdersThunks } from './SubOrders.slice';

import css from './SubOrders.module.scss';

const DELIVERING_TAB = ESubOrderTxStatus.DELIVERING;
const DELIVERED_TAB = ESubOrderTxStatus.DELIVERED;

const SubOrders = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const intl = useIntl();
  const { planId: planIdFromQuery, timestamp: timestampFromQuery } =
    router.query;

  const [activeTab, setActiveTab] = useState(DELIVERING_TAB);
  const [selectedSubOrder, setSelectedSubOrder] = useState<any>(null);
  const subOrderReviewModalControl = useBoolean();
  const currentUser = useAppSelector(currentUserSelector);
  const currentUserGetter = CurrentUser(currentUser);
  const currentUserId = currentUserGetter.getId();
  const ratingSubOrderModalControl = useBoolean();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const deliveredSubOrders = useAppSelector(
    (state) => state.ParticipantSubOrderList.deliveredSubOrders,
    shallowEqual,
  );
  const deliveringSubOrders = useAppSelector(
    (state) => state.ParticipantSubOrderList.deliveringSubOrders,
    shallowEqual,
  );

  const fetchSubOrdersInProgress = useAppSelector(
    (state) => state.ParticipantSubOrderList.fetchSubOrdersInProgress,
  );

  const participantPostRatingInProgress = useAppSelector(
    (state) => state.ParticipantOrderList.participantPostRatingInProgress,
  );

  useEffect(() => {
    if (planIdFromQuery && timestampFromQuery) {
      const subOrderId = `${currentUserId} - ${planIdFromQuery} - ${timestampFromQuery}`;
      const subOrder = deliveredSubOrders.find(
        (_subOrder) => _subOrder.id === subOrderId,
      );
      if (subOrder) {
        setActiveTab(DELIVERED_TAB);
        setSelectedSubOrder(subOrder);
        subOrderReviewModalControl.setTrue();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, deliveredSubOrders, planIdFromQuery, timestampFromQuery]);

  useEffect(() => {
    dispatch(
      SubOrdersThunks.fetchSubOrdersFromFirebase({
        participantId: currentUserId,
        txStatus: DELIVERING_TAB,
      }),
    );
    dispatch(
      SubOrdersThunks.fetchSubOrdersFromFirebase({
        participantId: currentUserId,
        txStatus: DELIVERED_TAB,
      }),
    );
  }, [currentUserId, dispatch]);

  useBottomScroll(() =>
    dispatch(
      SubOrdersThunks.fetchSubOrdersFromFirebase({
        participantId: currentUserId,
        txStatus: activeTab === DELIVERING_TAB ? DELIVERING_TAB : DELIVERED_TAB,
      }),
    ),
  );

  const tabItems = [
    {
      key: DELIVERING_TAB,
      label: (
        <div className={css.tabLabel}>
          <span>
            {intl.formatMessage({
              id: 'FilterPartnerOrderForm.subOrderStatus.delivering',
            })}
          </span>
          <div data-number className={css.totalItems}>
            {deliveringSubOrders.length}
          </div>
        </div>
      ),
      childrenFn: (props: any) => (
        <div>
          <SubOrderList {...props} />
        </div>
      ),
      childrenProps: {
        subOrders: deliveringSubOrders,
      },
    },
    {
      key: DELIVERED_TAB,
      label: (
        <div className={css.tabLabel}>
          <span>
            {intl.formatMessage({
              id: 'FilterPartnerOrderForm.subOrderStatus.delivered',
            })}
          </span>
          <div data-number className={css.totalItems}>
            {deliveredSubOrders.length}
          </div>
        </div>
      ),
      childrenFn: (props: any) => (
        <div>
          <SubOrderList {...props} />
        </div>
      ),
      childrenProps: {
        subOrders: deliveredSubOrders,
        setSelectedSubOrder,
        openSubOrderReviewModal: subOrderReviewModalControl.setTrue,
        setSelectedEvent,
        openRatingSubOrderModal: ratingSubOrderModalControl.setTrue,
      },
    },
  ];

  const onTabChange = (tab: any) => {
    setActiveTab(tab?.key);
  };

  return (
    <div className={css.container}>
      <div className={css.title}>
        {intl.formatMessage({ id: 'GeneralLayoutTopBar.menuItem.myOrders' })}
      </div>
      <Tabs items={tabItems as any} onChange={onTabChange} />
      <LoadingModal isOpen={fetchSubOrdersInProgress} />
      <RenderWhen condition={activeTab === DELIVERED_TAB && !!selectedSubOrder}>
        <SubOrderReviewModal
          isOpen={subOrderReviewModalControl.value}
          onClose={subOrderReviewModalControl.setFalse}
          subOrder={selectedSubOrder}
        />
      </RenderWhen>
      <RenderWhen condition={!!selectedEvent}>
        <RatingSubOrderModal
          isOpen={ratingSubOrderModalControl.value}
          onClose={ratingSubOrderModalControl.setFalse}
          selectedEvent={selectedEvent}
          currentUserId={currentUserId}
          participantPostRatingInProgress={participantPostRatingInProgress}
        />
      </RenderWhen>
      <BottomNavigationBar />
    </div>
  );
};

export default SubOrders;
