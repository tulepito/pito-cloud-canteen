/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import type { Event, View } from 'react-big-calendar';
import { Views } from 'react-big-calendar';
import { shallowEqual } from 'react-redux';
import compact from 'lodash/compact';
import flatten from 'lodash/flatten';
import { DateTime } from 'luxon';
import { useRouter } from 'next/router';

import BottomNavigationBar from '@components/BottomNavigationBar/BottomNavigationBar';
import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import OrderEventCard from '@components/CalendarDashboard/components/OrderEventCard/OrderEventCard';
import { EVENTS_MOCKUP } from '@components/CalendarDashboard/helpers/mockupData';
import useSelectDay from '@components/CalendarDashboard/hooks/useSelectDay';
import LoadingModal from '@components/LoadingModal/LoadingModal';
import ParticipantLayout from '@components/ParticipantLayout/ParticipantLayout';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { getItem } from '@helpers/localStorageHelpers';
import { isOver } from '@helpers/orderHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { useViewport } from '@hooks/useViewport';
import { CurrentUser, Listing } from '@src/utils/data';
import { getDaySessionFromDeliveryTime, isSameDate } from '@src/utils/dates';
import { EParticipantOrderStatus } from '@src/utils/enums';
import type { TListing, TObject } from '@src/utils/types';

import ParticipantToolbar from '../components/ParticipantToolbar/ParticipantToolbar';

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
  const { planId: planIdFromQuery, timestamp: timestampFromQuery } =
    router.query;

  const updateProfileModalControl = useBoolean();
  const onBoardingModal = useBoolean();
  const tourControl = useBoolean();
  const ratingSubOrderModalControl = useBoolean();
  const { selectedDay, handleSelectDay } = useSelectDay();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const subOrderDetailModalControl = useBoolean();
  const { isMobileLayout } = useViewport();
  const successRatingModalControl = useBoolean();
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const orders = useAppSelector(
    (state) => state.ParticipantOrderList.orders,
    shallowEqual,
  );
  const fetchOrdersInProgress = useAppSelector(
    (state) => state.ParticipantOrderList.fetchOrdersInProgress,
  );
  const subOrders = useAppSelector(
    (state) => state.ParticipantOrderList.allSubOrders,
    shallowEqual,
  );
  const plans = useAppSelector(
    (state) => state.ParticipantOrderList.allPlans,
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

  const currentUserGetter = CurrentUser(currentUser!);
  const currentUserId = currentUserGetter.getId();
  const { walkthroughEnable = true } = currentUserGetter.getMetadata();
  const welcomeModalControl = useBoolean(walkthroughEnable);

  const showLoadingModal =
    fetchOrdersInProgress ||
    updateSubOrderInProgress ||
    addSubOrderDocumentToFirebaseInProgress ||
    participantPostRatingInProgress;

  const events = subOrders.map((subOrder: any) => {
    const planKey = Object.keys(subOrder)[0];
    const planItem: TObject = subOrder[planKey];
    const currentPlan = plans?.find(
      (plan) => Listing(plan).getId() === planKey,
    ) as TListing;
    const orderId = mappingSubOrderToOrder[planKey];
    const order = orders?.find((_order) => Listing(_order).getId() === orderId);
    const orderListing = Listing(order);
    const { deliveryHour, deadlineDate } = orderListing.getMetadata();
    const { title: orderTitle } = orderListing.getAttributes();

    const listEvent: Event[] = [];

    Object.keys(planItem).forEach((planItemKey: string) => {
      const meal = planItem[planItemKey];
      const { restaurant = {}, foodList = [] } = meal;

      const dishes = foodList.map((food: TListing) => ({
        key: Listing(food).getId(),
        value: Listing(food).getAttributes().title,
      }));

      const currentPlanListing = Listing(currentPlan);

      const foodSelection =
        currentPlanListing.getMetadata().orderDetail[planItemKey].memberOrders[
          currentUserId
        ] || {};
      const expiredTime = deadlineDate
        ? DateTime.fromMillis(+deadlineDate)
        : DateTime.fromMillis(+planItemKey).minus({ day: 2 });

      const alreadyPickFood = !!foodSelection?.foodId;
      const pickFoodStatus = alreadyPickFood
        ? EParticipantOrderStatus.joined
        : isOver(expiredTime.toMillis())
        ? EParticipantOrderStatus.expired
        : foodSelection?.status;

      const event = {
        resource: {
          id: `${planKey} - ${planItemKey}`,
          timestamp: planItemKey,
          subOrderId: planKey,
          orderId,
          planId: planKey,
          daySession: getDaySessionFromDeliveryTime(deliveryHour),
          status: pickFoodStatus,
          type: 'dailyMeal',
          deliveryAddress: Listing(restaurant).getPublicData().location,
          restaurant: {
            name: Listing(restaurant).getAttributes().title,
            id: Listing(restaurant).getId(),
          },
          meal: {
            dishes,
          },
          deadlineDate,
          orderColor: colorOrderMap[orderId],
          expiredTime: expiredTime.toMillis(),
          deliveryHour,
          dishSelection: { dishSelection: foodSelection?.foodId },
          transactionId:
            currentPlanListing.getMetadata().orderDetail[planItemKey]
              ?.transactionId,
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

  const defaultView = isMobileLayout
    ? Views.MONTH
    : (getItem('participant_calendarView') as View) || Views.WEEK;

  const subOrdersFromSelectedDayTxIds = compact(
    subOrdersFromSelectedDay.map(
      (_event: any) => _event.resource.transactionId,
    ),
  );

  const openUpdateProfileModal = () => {
    updateProfileModalControl.setTrue();
  };
  const handleCloseWalkThrough = () => {
    tourControl.setFalse();
    onBoardingModal.setFalse();
    dispatch(OrderListThunks.disableWalkthrough(currentUserId));
  };

  const onRejectSelectDish = (params: any) => {
    const { orderId, orderDay, planId } = params;
    const payload = {
      updateValues: {
        orderId,
        orderDay,
        planId,
        memberOrders: {
          [currentUserId]: {
            status: 'notJoined',
            foodId: '',
          },
        },
      },
      orderId,
    };

    dispatch(OrderListThunks.updateSubOrder(payload));
  };

  const handleOnBoardingModalOpen = () => {
    onBoardingModal.setTrue();
    setTimeout(() => {
      tourControl.setTrue();
    }, 1000);
  };

  const openRatingSubOrderModal = () => {
    ratingSubOrderModalControl.setTrue();
  };

  useEffect(() => {
    if (subOrdersFromSelectedDayTxIds && !walkthroughEnable) {
      dispatch(
        OrderListThunks.fetchTransactionBySubOrder(
          subOrdersFromSelectedDayTxIds,
        ),
      );
    }
  }, [subOrdersFromSelectedDayTxIds]);

  useEffect(() => {
    (async () => {
      if (!walkthroughEnable) {
        await dispatch(OrderListThunks.fetchOrders(currentUserId));
        dispatch(OrderListActions.markColorToOrder());
      }
    })();
  }, [currentUserId, walkthroughEnable]);

  useEffect(() => {
    dispatch(OrderListThunks.fetchAttributes());
  }, []);

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
        setSelectedEvent(event);
        subOrderDetailModalControl.setTrue();
      }
    }
  }, [planIdFromQuery, timestampFromQuery]);

  return (
    <ParticipantLayout>
      <OrderListHeaderSection />
      <div className={css.calendarContainer}>
        <CalendarDashboard
          anchorDate={selectedDay}
          events={walkthroughEnable ? EVENTS_MOCKUP : flattenEvents}
          renderEvent={OrderEventCard}
          inProgress={showLoadingModal}
          defautlView={defaultView}
          // exposeAnchorDate={handleAnchorDateChange}
          components={{
            toolbar: (toolBarProps: any) => (
              <ParticipantToolbar
                {...toolBarProps}
                onChangeDate={handleSelectDay}
              />
            ),
          }}
        />
      </div>
      <div className={css.subOrderContainer}>
        {subOrdersFromSelectedDay.map((_event) => (
          <SubOrderCard
            key={_event.resource?.id}
            event={_event}
            onRejectSelectDish={onRejectSelectDish}
            setSelectedEvent={setSelectedEvent}
            openSubOrderDetailModal={subOrderDetailModalControl.setTrue}
          />
        ))}
      </div>
      <RenderWhen condition={walkthroughEnable}>
        <>
          <WelcomeModal
            isOpen={welcomeModalControl.value}
            onClose={welcomeModalControl.setFalse}
            openUpdateProfileModal={openUpdateProfileModal}
          />
          <UpdateProfileModal
            isOpen={updateProfileModalControl.value}
            onClose={updateProfileModalControl.setFalse}
            currentUser={currentUser!}
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
        </>
      </RenderWhen>
      <RenderWhen condition={!!selectedEvent}>
        <div className={css.subOrderDetailModal}>
          <SubOrderDetailModal
            isOpen={subOrderDetailModalControl.value}
            onClose={subOrderDetailModalControl.setFalse}
            event={selectedEvent!}
            openRatingSubOrderModal={openRatingSubOrderModal}
          />
          <RatingSubOrderModal
            isOpen={ratingSubOrderModalControl.value}
            onClose={ratingSubOrderModalControl.setFalse}
            selectedEvent={selectedEvent}
            currentUserId={currentUserId}
            openSuccessRatingModal={successRatingModalControl.setTrue}
          />
        </div>
      </RenderWhen>
      <SuccessRatingModal
        isOpen={successRatingModalControl.value}
        onClose={successRatingModalControl.setFalse}
      />

      <BottomNavigationBar />
      <LoadingModal isOpen={showLoadingModal} />
    </ParticipantLayout>
  );
};

export default OrderListPage;
