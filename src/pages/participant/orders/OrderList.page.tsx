/* eslint-disable no-unneeded-ternary */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import type { Event, View } from 'react-big-calendar';
import { Views } from 'react-big-calendar';
import { shallowEqual } from 'react-redux';
import flatten from 'lodash/flatten';
import { DateTime } from 'luxon';
import { useRouter } from 'next/router';

import Avatar from '@components/Avatar/Avatar';
import BottomNavigationBar from '@components/BottomNavigationBar/BottomNavigationBar';
import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import OrderEventCard from '@components/CalendarDashboard/components/OrderEventCard/OrderEventCard';
import { EVENT_STATUS } from '@components/CalendarDashboard/helpers/constant';
import { EVENTS_MOCKUP } from '@components/CalendarDashboard/helpers/mockupData';
import useSelectDay from '@components/CalendarDashboard/hooks/useSelectDay';
import LoadingModal from '@components/LoadingModal/LoadingModal';
import ParticipantLayout from '@components/ParticipantLayout/ParticipantLayout';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import Tabs from '@components/Tabs/Tabs';
import { getItem, setItem } from '@helpers/localStorageHelpers';
import { isOver, prepareDaySession } from '@helpers/orderHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { useViewport } from '@hooks/useViewport';
import { CalendarActions } from '@redux/slices/Calendar.slice';
import { CurrentUser, Listing, User } from '@src/utils/data';
import {
  getNextMonth,
  getPrevMonth,
  getStartOfMonth,
  isSameDate,
} from '@src/utils/dates';
import { EOrderStates, EParticipantOrderStatus } from '@src/utils/enums';
import {
  ETransition,
  TRANSITIONS_TO_STATE_CANCELED,
} from '@src/utils/transaction';
import type { TListing, TUser } from '@src/utils/types';

import ParticipantToolbar from '../components/ParticipantToolbar/ParticipantToolbar';

import NotificationModal from './components/NotificationModal/NotificationModal';
import OnboardingOrderModal from './components/OnboardingOrderModal/OnboardingOrderModal';
import OnboardingTour from './components/OnboardingTour/OnboardingTour';
import OrderListHeaderSection from './components/OrderListHeaderSection/OrderListHeaderSection';
import RatingSubOrderModal from './components/RatingSubOrderModal/RatingSubOrderModal';
import SubOrderCard from './components/SubOrderCard/SubOrderCard';
import SubOrderDetailModal from './components/SubOrderDetailModal/SubOrderDetailModal';
import SuccessRatingModal from './components/SuccessRatingModal/SuccessRatingModal';
import UpdateProfileModal from './components/UpdateProfileModal/UpdateProfileModal';
import WelcomeModal from './components/WelcomeModal/WelcomeModal';
import { OrderListActions, OrderListThunks } from './OrderList.slice';

import css from './OrderList.module.scss';

const OrderListPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const {
    planId: planIdFromQuery,
    timestamp: timestampFromQuery,
    viewMode,
  } = router.query;
  const localStorageView = getItem('participant_calendarView');
  const isValidLocalStorageView = ['month', 'week'].includes(
    localStorageView as View,
  );

  const [defaultCalendarView, setDefaultCalendarView] = useState<View>(
    viewMode
      ? viewMode
      : isValidLocalStorageView
      ? localStorageView
      : Views.WEEK,
  );
  const updateProfileModalControl = useBoolean();
  const onBoardingModal = useBoolean();
  const tourControl = useBoolean();
  const ratingSubOrderModalControl = useBoolean();
  const { selectedDay, handleSelectDay } = useSelectDay();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<Date>(
    getStartOfMonth(selectedDay || new Date()),
  );
  const [maxSelectedMonth, setMaxSelectedMonth] = useState<Date>(
    getStartOfMonth(new Date()),
  );
  const [minSelectedMonth, setMinSelectedMonth] = useState<Date>(
    getStartOfMonth(new Date()),
  );
  const isFirstTimeReachMinOrMaxMonthControl = useBoolean(true);

  const subOrderDetailModalControl = useBoolean();
  const { isMobileLayout } = useViewport();
  const successRatingModalControl = useBoolean();
  const notificationModalControl = useBoolean();
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const orders = useAppSelector(
    (state) => state.ParticipantOrderList.orders,
    shallowEqual,
  );
  const fetchOrdersInProgress = useAppSelector(
    (state) => state.ParticipantOrderList.fetchOrdersInProgress,
  );
  const plans = useAppSelector(
    (state) => state.ParticipantOrderList.allPlans,
    shallowEqual,
  );
  const restaurants = useAppSelector(
    (state) => state.ParticipantOrderList.restaurants,
    shallowEqual,
  );
  const mappingSubOrderToOrder = useAppSelector(
    (state) => state.ParticipantOrderList.mappingSubOrderToOrder,
    shallowEqual,
  );
  const updateSubOrderInProgress = useAppSelector(
    (state) => state.ParticipantOrderList.updateSubOrderInProgress,
  );
  const colorOrderMap = useAppSelector(
    (state) => state.ParticipantOrderList.colorOrderMap,
  );
  const addSubOrderDocumentToFirebaseInProgress = useAppSelector(
    (state) =>
      state.ParticipantOrderList.addSubOrderDocumentToFirebaseInProgress,
  );
  const participantPostRatingInProgress = useAppSelector(
    (state) => state.ParticipantOrderList.participantPostRatingInProgress,
  );
  const notifications = useAppSelector(
    (state) => state.ParticipantOrderList.participantFirebaseNotifications,
  );
  const fetchParticipantFirebaseNotificationsInProgress = useAppSelector(
    (state) =>
      state.ParticipantOrderList
        .fetchParticipantFirebaseNotificationsInProgress,
  );
  const fetchSubOrderTxInProgress = useAppSelector(
    (state) => state.ParticipantOrderList.fetchSubOrderTxInProgress,
  );
  const pickFoodForSubOrdersInProgress = useAppSelector(
    (state) => state.ParticipantOrderList.pickFoodForSubOrdersInProgress,
  );
  const pickFoodForSpecificSubOrderInProgress = useAppSelector(
    (state) => state.ParticipantOrderList.pickFoodForSpecificSubOrderInProgress,
  );
  const company = useAppSelector(
    (state) => state.ParticipantOrderList.company,
    shallowEqual,
  );

  const currentUserGetter = CurrentUser(currentUser!);
  const currentUserId = currentUserGetter.getId();
  const { walkthroughEnable = true } = currentUserGetter.getMetadata();
  const welcomeModalControl = useBoolean(walkthroughEnable);

  const showLoadingModal =
    (fetchOrdersInProgress ||
      updateSubOrderInProgress ||
      addSubOrderDocumentToFirebaseInProgress ||
      participantPostRatingInProgress ||
      fetchOrdersInProgress ||
      updateSubOrderInProgress ||
      addSubOrderDocumentToFirebaseInProgress ||
      participantPostRatingInProgress ||
      fetchParticipantFirebaseNotificationsInProgress ||
      fetchSubOrderTxInProgress) &&
    !walkthroughEnable;

  const unseenNotifications = notifications.filter(
    (notification) => !notification.seen,
  );
  const numberOfUnseenNotifications = unseenNotifications.length;

  const allPlansIdList = plans?.map((plan) => Listing(plan).getId()) || [];
  const events = allPlansIdList.map((planId: string) => {
    const currentPlan = plans?.find(
      (plan) => Listing(plan).getId() === planId,
    ) as TListing;
    const orderId = mappingSubOrderToOrder[planId];
    const order = orders?.find((_order) => Listing(_order).getId() === orderId);
    const orderGetter = Listing(order);
    const {
      deliveryHour,
      deadlineDate,
      orderStateHistory = [],
      orderState,
      companyName = 'PCC',
      daySession,
    } = orderGetter.getMetadata();
    const { title: orderTitle } = orderGetter.getAttributes();
    const isOrderCanceled =
      orderState === EOrderStates.canceled ||
      orderState === EOrderStates.canceledByBooker;

    const { orderDetail = {} } = Listing(currentPlan).getMetadata();
    const listEvent: Event[] = [];

    Object.keys(orderDetail).forEach((planItemKey: string) => {
      const {
        lastTransition,
        memberOrders = {},
        restaurant = {},
      } = orderDetail[planItemKey] || {};
      const { foodList = {}, restaurantName, id } = restaurant;
      const restaurantListing = restaurants?.find(
        (_restaurant) => Listing(_restaurant).getId() === id,
      );
      const restaurantGetter = Listing(restaurantListing!);
      const dishes = Object.keys(foodList).map((foodId: string) => ({
        key: foodId,
        value: foodList[foodId].foodName,
      }));

      const foodSelection = memberOrders[currentUserId] || {};
      const expiredTime = deadlineDate
        ? DateTime.fromMillis(+deadlineDate)
        : DateTime.fromMillis(+planItemKey).minus({ day: 2 });

      const alreadyPickFood = !!foodSelection?.foodId;
      const pickFoodStatus = isOrderCanceled
        ? EVENT_STATUS.CANCELED_STATUS
        : alreadyPickFood
        ? EParticipantOrderStatus.joined
        : isOver(expiredTime.toMillis())
        ? EParticipantOrderStatus.expired
        : foodSelection?.status;

      const isSubOrderNotAbleToEdit = [
        ...TRANSITIONS_TO_STATE_CANCELED,
        ETransition.START_DELIVERY,
        ETransition.COMPLETE_DELIVERY,
      ].includes(lastTransition);

      const isOrderAlreadyInProgress =
        orderStateHistory.findIndex(
          ({ state }: { state: string }) => state === EOrderStates.inProgress,
        ) !== -1;

      const event = {
        resource: {
          id: `${planId} - ${planItemKey}`,
          timestamp: planItemKey,
          subOrderId: planId,
          orderId,
          planId,
          daySession: prepareDaySession(daySession, deliveryHour),
          status: pickFoodStatus,
          type: 'dailyMeal',
          restaurantAddress: restaurantGetter.getPublicData().location?.address,
          restaurant: {
            name: restaurantName,
            id,
          },
          meal: {
            dishes,
          },
          deadlineDate,
          companyName,
          isOrderStarted: isOrderAlreadyInProgress,
          orderColor: colorOrderMap[orderId],
          expiredTime: expiredTime.toMillis(),
          deliveryHour,
          dishSelection: { dishSelection: foodSelection?.foodId },
          orderState,
          lastTransition,
          foodName: dishes.find((_dish) => _dish.key === foodSelection?.foodId)
            ?.value,
          disableSelectFood:
            isOrderAlreadyInProgress && isSubOrderNotAbleToEdit,
        },
        title: orderTitle,
        start: DateTime.fromMillis(+planItemKey).toJSDate(),
        end: DateTime.fromMillis(+planItemKey).plus({ hour: 1 }).toJSDate(),
      };
      listEvent.push(event);
    });

    return listEvent;
  });

  const flattenEvents = flatten<Event>(events);

  const subOrdersFromSelectedDay = flattenEvents.filter((_event: any) =>
    isSameDate(_event.start, selectedDay),
  );

  const openUpdateProfileModal = () => {
    updateProfileModalControl.setTrue();
  };
  const handleCloseWalkThrough = () => {
    tourControl.setFalse();
    onBoardingModal.setFalse();
    dispatch(OrderListThunks.disableWalkthrough(currentUserId));
  };

  const handleOnBoardingModalOpen = () => {
    onBoardingModal.setTrue();
    updateProfileModalControl.setFalse();
    setTimeout(() => {
      tourControl.setTrue();
    }, 0);
  };

  const openRatingSubOrderModal = () => {
    subOrderDetailModalControl.setFalse();
    ratingSubOrderModalControl.setTrue();
  };

  const openSuccessRatingModal = () => {
    ratingSubOrderModalControl.setFalse();
    successRatingModalControl.setTrue();
  };

  const closeAllModals = () => {
    successRatingModalControl.setFalse();
  };

  const handleChangeTimePeriod = (action: string) => {
    if (action === 'NEXT') {
      const nextMonth = getNextMonth(selectedMonth!);
      setSelectedMonth(nextMonth);

      if (nextMonth.getTime() > maxSelectedMonth.getTime()!) {
        setMaxSelectedMonth(nextMonth);
        isFirstTimeReachMinOrMaxMonthControl.setTrue();

        return;
      }
    } else {
      const prevMonth = getPrevMonth(selectedMonth!);
      setSelectedMonth(prevMonth);

      if (minSelectedMonth.getTime() > prevMonth.getTime()) {
        setMinSelectedMonth(prevMonth);
        isFirstTimeReachMinOrMaxMonthControl.setTrue();

        return;
      }
    }
    isFirstTimeReachMinOrMaxMonthControl.setFalse();
  };

  const recommendFoodForSubOrder = () => {
    const neededRecommendSubOrders = flattenEvents.reduce(
      (result: any, _event: Event) => {
        const { resource } = _event;
        const { status, dishSelection, orderState } = resource;
        if (
          status === EParticipantOrderStatus.empty &&
          !dishSelection.dishSelection &&
          orderState === EOrderStates.picking
        ) {
          result.push({
            planId: resource.planId,
            orderId: resource.orderId,
            subOrderDate: resource.timestamp,
          });
        }

        return result;
      },
      [],
    );

    dispatch(
      OrderListThunks.pickFoodForSubOrders({
        recommendSubOrders: neededRecommendSubOrders,
        recommendFrom: 'orderList',
      }),
    );
  };

  const recommendFoodForSpecificSubOrder = (params: {
    planId: string;
    orderId: string;
    subOrderDate: string;
  }) => {
    dispatch(
      OrderListThunks.pickFoodForSpecificSubOrder({
        recommendSubOrder: params,
        recommendFrom: 'orderList',
      }),
    );
  };

  useEffect(() => {
    if (isMobileLayout) {
      setItem('participant_calendarView', Views.MONTH);
      setDefaultCalendarView(Views.MONTH);
    } else {
      setItem('participant_calendarView', Views.WEEK);
      setDefaultCalendarView(Views.WEEK);
    }
  }, [isMobileLayout]);

  useEffect(() => {
    if (selectedEvent) {
      const { timestamp, planId } = selectedEvent.resource;
      const subOrderId = `${currentUserId} - ${planId} - ${timestamp}`;
      dispatch(OrderListThunks.fetchSubOrdersFromFirebase(subOrderId));
    }
  }, [selectedEvent]);

  useEffect(() => {
    (async () => {
      const isOutOfMinMaxSelectedMonthRange =
        selectedMonth?.getTime()! >= maxSelectedMonth.getTime()! ||
        minSelectedMonth.getTime() >= selectedMonth?.getTime()!;

      if (
        isOutOfMinMaxSelectedMonthRange &&
        isFirstTimeReachMinOrMaxMonthControl.value
      ) {
        await dispatch(
          OrderListThunks.fetchOrders({ userId: currentUserId, selectedMonth }),
        );
        dispatch(OrderListActions.markColorToOrder());
      }
    })();
  }, [
    currentUserId,
    selectedMonth,
    minSelectedMonth,
    maxSelectedMonth,
    isFirstTimeReachMinOrMaxMonthControl.value,
  ]);

  useEffect(() => {
    if (planIdFromQuery && timestampFromQuery) {
      const planId = planIdFromQuery as string;
      const timestamp = timestampFromQuery as string;
      const event = flattenEvents.find(
        (_event) =>
          _event.resource.planId === planId &&
          _event.resource.timestamp === timestamp,
      );
      if (event) {
        dispatch(CalendarActions.setSelectedDay(new Date(+timestamp)));
        setSelectedEvent(event);
        subOrderDetailModalControl.setTrue();
      } else {
        const monthInQuery = getStartOfMonth(
          DateTime.fromMillis(+timestamp).toJSDate(),
        );
        setSelectedMonth(getStartOfMonth(monthInQuery));

        if (monthInQuery.getTime() > maxSelectedMonth?.getTime()!) {
          setMaxSelectedMonth(monthInQuery);
        }

        if (minSelectedMonth.getTime() > monthInQuery.getTime()) {
          setMinSelectedMonth(monthInQuery);
        }
      }
    }
  }, [planIdFromQuery, timestampFromQuery, JSON.stringify(flattenEvents)]);

  useEffect(() => {
    dispatch(OrderListThunks.fetchParticipantFirebaseNotifications());
    dispatch(CalendarActions.setSelectedDay(null));
  }, []);

  const orderListPageContent = (
    <>
      <div className={css.calendarContainer}>
        <CalendarDashboard
          anchorDate={selectedDay}
          events={walkthroughEnable ? EVENTS_MOCKUP : flattenEvents}
          renderEvent={OrderEventCard}
          inProgress={fetchOrdersInProgress}
          defaultView={defaultCalendarView}
          // exposeAnchorDate={handleAnchorDateChange}
          components={{
            toolbar: (toolBarProps: any) => (
              <ParticipantToolbar
                {...toolBarProps}
                isAllowChangePeriod
                onChangeDate={handleSelectDay}
                onCustomPeriodClick={handleChangeTimePeriod}
                onPickForMe={recommendFoodForSubOrder}
                onPickForMeLoading={pickFoodForSubOrdersInProgress}
              />
            ),
          }}
          resources={{
            walkthroughEnable,
            openRatingSubOrderModal,
            setSelectedEvent,
            recommendFoodForSpecificSubOrder,
            pickFoodForSpecificSubOrderInProgress,
          }}
        />
      </div>
      <div className={css.subOrderContainer}>
        {subOrdersFromSelectedDay.map((_event) => (
          <SubOrderCard
            key={_event.resource?.id}
            event={_event}
            setSelectedEvent={setSelectedEvent}
            openSubOrderDetailModal={subOrderDetailModalControl.setTrue}
          />
        ))}
      </div>
      <RenderWhen condition={walkthroughEnable}>
        <WelcomeModal
          isOpen={welcomeModalControl.value}
          onClose={welcomeModalControl.setFalse}
          openUpdateProfileModal={openUpdateProfileModal}
        />
        <UpdateProfileModal
          isOpen={updateProfileModalControl.value}
          onClose={() => {}}
          currentUser={currentUser!}
          handleCloseWalkThrough={handleCloseWalkThrough}
          handleOnBoardingModalOpen={handleOnBoardingModalOpen}
        />
        <OnboardingOrderModal
          isOpen={onBoardingModal.value}
          onClose={onBoardingModal.setFalse}
          isDuringTour={tourControl.value}
        />
        <OnboardingTour
          isTourOpen={tourControl.value}
          closeTour={handleCloseWalkThrough}
        />
      </RenderWhen>
      <RenderWhen condition={!!selectedEvent}>
        <div className={css.subOrderDetailModal}>
          <RenderWhen condition={isMobileLayout}>
            <SubOrderDetailModal
              isOpen={subOrderDetailModalControl.value}
              onClose={subOrderDetailModalControl.setFalse}
              event={selectedEvent!}
              openRatingSubOrderModal={openRatingSubOrderModal}
              from="orderList"
              recommendFoodForSpecificSubOrder={
                recommendFoodForSpecificSubOrder
              }
              pickFoodForSpecificSubOrderInProgress={
                pickFoodForSpecificSubOrderInProgress
              }
            />
          </RenderWhen>
          <RatingSubOrderModal
            isOpen={ratingSubOrderModalControl.value}
            onClose={ratingSubOrderModalControl.setFalse}
            selectedEvent={selectedEvent}
            currentUserId={currentUserId}
            openSuccessRatingModal={openSuccessRatingModal}
            participantPostRatingInProgress={participantPostRatingInProgress}
          />
        </div>
      </RenderWhen>
      <SuccessRatingModal
        isOpen={successRatingModalControl.value}
        onClose={successRatingModalControl.setFalse}
        closeAllModals={closeAllModals}
        fromOrderList
      />
      <RenderWhen condition={isMobileLayout}>
        <NotificationModal
          isOpen={notificationModalControl.value}
          onClose={notificationModalControl.setFalse}
        />
      </RenderWhen>
    </>
  );

  const tabOptions = [
    {
      id: 'company',
      label: (
        <div className={css.companyTab}>
          <Avatar
            className={css.companyAvatar}
            user={company as TUser}
            disableProfileLink
          />
          <span>{User(company as TUser).getPublicData().companyName}</span>
        </div>
      ),
      childrenFn: () => orderListPageContent,
      childrenProps: {},
    },
  ];

  return (
    <ParticipantLayout>
      <OrderListHeaderSection
        openNotificationModal={notificationModalControl.setTrue}
        numberOfUnseenNotifications={numberOfUnseenNotifications}
      />
      <Tabs items={tabOptions as any} headerClassName={css.tabHeader} />

      <BottomNavigationBar />
      <LoadingModal isOpen={showLoadingModal} />
    </ParticipantLayout>
  );
};

export default OrderListPage;
