import { useEffect, useState } from 'react';
import type { Event } from 'react-big-calendar';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import Link from 'next/link';
import { useRouter } from 'next/router';

import BottomNavigationBar from '@components/BottomNavigationBar/BottomNavigationBar';
import LoadingModal from '@components/LoadingModal/LoadingModal';
import RatingReview from '@components/RatingReview/RatingReview';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import Tabs from '@components/Tabs/Tabs';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { useBottomScroll } from '@hooks/useBottomScroll';
import { useUserInEvent } from '@hooks/useUserInEvent';
import { fetchParticipantReviews } from '@redux/slices/Reviews.participant.slice';
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
const RATING_HISTORY_TAB = 'rating-history';

const SubOrders = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const intl = useIntl();
  const {
    planId: planIdFromQuery,
    timestamp: timestampFromQuery,
    tab: tabFromQuery = DELIVERED_TAB,
  } = router.query;

  const FIRST_PAGE = 1;
  const [page, setPage] = useState(FIRST_PAGE);
  const { reviews, pagination, fetchReviewsInProgress, fetchReviewsError } =
    useAppSelector((state) => state.participantReviews);

  const getTabIndex = (tabKey: string | string[] | undefined): string => {
    const key = Array.isArray(tabKey) ? tabKey[0] : tabKey;

    if (key === DELIVERING_TAB) {
      return '1';
    }
    if (key === DELIVERED_TAB) {
      return '2';
    }
    if (key === RATING_HISTORY_TAB) {
      return '3';
    }

    return '2';
  };

  const [activeTab, setActiveTab] = useState<ESubOrderTxStatus | string>(
    (tabFromQuery as string) || DELIVERED_TAB,
  );

  useEffect(() => {
    const tabFromUrl = (tabFromQuery as string) || DELIVERED_TAB;
    if (tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabFromQuery]);
  const [selectedSubOrder, setSelectedSubOrder] = useState<any>(null);
  const subOrderReviewModalControl = useBoolean();
  const currentUser = useAppSelector(currentUserSelector);
  const currentUserGetter = CurrentUser(currentUser);
  const currentUserId = currentUserGetter.getId();
  const ratingSubOrderModalControl = useBoolean();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { isUserInEvent } = useUserInEvent();
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

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    dispatch(fetchParticipantReviews({ page: newPage }));
  };

  useEffect(() => {
    dispatch(fetchParticipantReviews({}));
  }, [dispatch]);

  useEffect(() => {
    if (planIdFromQuery && timestampFromQuery) {
      const subOrderId = `${currentUserId} - ${planIdFromQuery} - ${timestampFromQuery}`;
      const subOrder = deliveredSubOrders.find(
        (_subOrder) => _subOrder.id === subOrderId,
      );
      if (subOrder) {
        if (tabFromQuery !== DELIVERED_TAB) {
          router.replace(
            {
              pathname: router.pathname,
              query: { ...router.query, tab: DELIVERED_TAB },
            },
            undefined,
            { shallow: true },
          );
        }
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

  useBottomScroll(() => {
    if (activeTab === DELIVERING_TAB || activeTab === DELIVERED_TAB) {
      dispatch(
        SubOrdersThunks.fetchSubOrdersFromFirebase({
          participantId: currentUserId,
          txStatus:
            activeTab === DELIVERING_TAB ? DELIVERING_TAB : DELIVERED_TAB,
        }),
      );
    }
  });

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
    {
      key: RATING_HISTORY_TAB,
      label: (
        <div className={css.tabLabel}>
          <span>
            {intl.formatMessage({
              id: 'ManageParticipantsRatingHistoryPage.title',
            })}
          </span>
          <div data-number className={css.totalItems}>
            {reviews.length}
          </div>
        </div>
      ),
      childrenFn: () => (
        <div>
          <RatingReview
            reviews={reviews}
            fetchReviewsInProgress={fetchReviewsInProgress}
            fetchReviewsError={fetchReviewsError}
            pagination={pagination}
            handlePageChange={handlePageChange}
            page={page}
            isDisabledReply={true}
          />
        </div>
      ),
    },
  ];

  const onTabChange = (tab: any) => {
    const newTabKey = tab?.key;

    if (newTabKey && newTabKey !== activeTab) {
      setActiveTab(newTabKey);

      router.replace(
        {
          pathname: router.pathname,
          query: { ...router.query, tab: newTabKey },
        },
        undefined,
        { shallow: true },
      );
    }
  };

  return (
    <div className={css.container}>
      <div className={`${css.title} flex justify-between items-center`}>
        {intl.formatMessage({ id: 'GeneralLayoutTopBar.menuItem.myOrders' })}
        <RenderWhen condition={isUserInEvent}>
          <Link
            href="/participant/events/mens-day"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-br from-[#5ec9ff] to-[#b1e4fe] text-white text-sm font-semibold no-underline shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm">
            <span className="uppercase tracking-[0.02em]">Nhận quà</span>
            <span className="px-[10px] py-0.5 rounded-full bg-white/15 text-xs leading-4">
              19.11
            </span>
          </Link>
        </RenderWhen>
      </div>
      <Tabs
        items={tabItems as any}
        onChange={onTabChange}
        defaultActiveKey={getTabIndex(activeTab)}
      />
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
