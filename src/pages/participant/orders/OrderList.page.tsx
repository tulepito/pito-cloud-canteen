/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import type { Event } from 'react-big-calendar';
import { shallowEqual } from 'react-redux';
import flatten from 'lodash/flatten';
import { DateTime } from 'luxon';

import BottomNavigationBar from '@components/BottomNavigationBar/BottomNavigationBar';
import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import OrderEventCard from '@components/CalendarDashboard/components/OrderEventCard/OrderEventCard';
import LoadingModal from '@components/LoadingModal/LoadingModal';
import ParticipantLayout from '@components/ParticipantLayout/ParticipantLayout';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { isOver } from '@helpers/orderHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { participantOrderManagementThunks } from '@redux/slices/ParticipantOrderManagementPage.slice';
import { CurrentUser, Listing } from '@src/utils/data';
import { getDaySessionFromDeliveryTime, isSameDate } from '@src/utils/dates';
import { EParticipantOrderStatus } from '@src/utils/enums';
import type { TListing, TObject } from '@src/utils/types';

import ParticipantToolbar from '../components/ParticipantToolbar/ParticipantToolbar';

import OnboardingOrderModal from './components/OnboardingOrderModal/OnboardingOrderModal';
import OnboardingTour from './components/OnboardingTour/OnboardingTour';
import OrderListHeaderSection from './components/OrderListHeaderSection/OrderListHeaderSection';
import SubOrderCard from './components/SubOrderCard/SubOrderCard';
import SubOrderDetailModal from './components/SubOrderDetailModal/SubOrderDetailModal';
import UpdateProfileModal from './components/UpdateProfileModal/UpdateProfileModal';
import WelcomeModal from './components/WelcomeModal/WelcomeModal';
import { OrderListActions, OrderListThunks } from './OrderList.slice';

import css from './OrderList.module.scss';

const OrderListPage = () => {
  const dispatch = useAppDispatch();
  const welcomeModalControl = useBoolean();
  const updateProfileModalControl = useBoolean();
  const onBoardingModal = useBoolean();
  const tourControl = useBoolean();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const subOrderDetailModalControl = useBoolean();
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
  const updateOrderInProgress = useAppSelector(
    (state) => state.ParticipantOrderManagementPage.updateOrderInProgress,
  );
  const selectedDay = useAppSelector((state) => state.Calendar.selectedDay);
  const colorOrderMap = useAppSelector(
    (state) => state.ParticipantOrderList.colorOrderMap,
  );

  const currentUserGetter = CurrentUser(currentUser!);
  const currentUserId = currentUserGetter.getId();
  const { walkthroughEnable = true } = currentUserGetter.getMetadata();
  useEffect(() => {
    (async () => {
      await dispatch(OrderListThunks.fetchOrders(currentUserId));
      dispatch(OrderListActions.markColorToOrder());
    })();
  }, [currentUserId]);

  useEffect(() => {
    dispatch(OrderListThunks.fetchAttributes());
  }, []);

  const showLoadingModal = fetchOrdersInProgress || updateOrderInProgress;

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

      const pickFoodStatus = isOver(expiredTime.toMillis())
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

    dispatch(participantOrderManagementThunks.updateOrder(payload));
  };

  return (
    <ParticipantLayout>
      <OrderListHeaderSection />
      <div className={css.calendarContainer}>
        <CalendarDashboard
          // anchorDate={anchorDate}
          events={flattenEvents}
          // companyLogo={sectionCompanyBranding}
          renderEvent={OrderEventCard}
          inProgress={fetchOrdersInProgress}
          // exposeAnchorDate={handleAnchorDateChange}
          components={{
            toolbar: (toolBarProps: any) => (
              <ParticipantToolbar
                {...toolBarProps}
                // startDate={new Date(startDate)}
                // endDate={new Date(endDate)}
                // anchorDate={anchorDate}
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
      <WelcomeModal
        isOpen={welcomeModalControl.value}
        onClose={welcomeModalControl.setFalse}
        openUpdateProfileModal={openUpdateProfileModal}
      />
      <UpdateProfileModal
        isOpen={updateProfileModalControl.value}
        onClose={updateProfileModalControl.setFalse}
        currentUser={currentUser!}
      />
      <RenderWhen condition={walkthroughEnable}>
        <>
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
        <SubOrderDetailModal
          isOpen={subOrderDetailModalControl.value}
          onClose={subOrderDetailModalControl.setFalse}
          event={selectedEvent!}
        />
      </RenderWhen>

      <BottomNavigationBar />
      <LoadingModal isOpen={showLoadingModal} />
    </ParticipantLayout>
  );
};

export default OrderListPage;
