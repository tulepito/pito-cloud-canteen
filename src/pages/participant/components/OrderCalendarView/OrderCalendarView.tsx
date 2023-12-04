/* eslint-disable no-unneeded-ternary */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import type { Event, View } from 'react-big-calendar';
import { Views } from 'react-big-calendar';
import Skeleton from 'react-loading-skeleton';
import flatten from 'lodash/flatten';
import { DateTime } from 'luxon';
import { useRouter } from 'next/router';

import Avatar from '@components/Avatar/Avatar';
import BottomNavigationBar from '@components/BottomNavigationBar/BottomNavigationBar';
import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import OrderEventCard from '@components/CalendarDashboard/components/OrderEventCard/OrderEventCard';
import {
  EVENT_STATUS,
  MORNING_SESSION,
} from '@components/CalendarDashboard/helpers/constant';
import LoadingModal from '@components/LoadingModal/LoadingModal';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { getItem } from '@helpers/localStorageHelpers';
import { markColorForOrder } from '@helpers/orderHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import useSubOrderPicking from '@pages/participant/hooks/useSubOrderPicking';
import RatingSubOrderModal from '@pages/participant/orders/components/RatingSubOrderModal/RatingSubOrderModal';
import SubOrderCard from '@pages/participant/orders/components/SubOrderCard/SubOrderCard';
import SubOrderDetailModal from '@pages/participant/orders/components/SubOrderDetailModal/SubOrderDetailModal';
import SuccessRatingModal from '@pages/participant/orders/components/SuccessRatingModal/SuccessRatingModal';
import { OrderListThunks } from '@pages/participant/orders/OrderList.slice';
import { CalendarActions } from '@redux/slices/Calendar.slice';
import { isOver, isSameDate } from '@src/utils/dates';
import { EOrderStates, EParticipantOrderStatus } from '@src/utils/enums';
import { convertStringToNumber } from '@src/utils/number';
import { CurrentUser, Listing, User } from '@utils/data';
import type {
  TCurrentUser,
  TListing,
  TObject,
  TTransaction,
  TUser,
} from '@utils/types';

import ParticipantToolbar from '../ParticipantToolbar/ParticipantToolbar';

import css from './OrderCalendarView.module.scss';

type TOrderCalendarViewProps = {
  company: TUser;
  order: TListing;
  plans?: TListing[];
  pickedFoods?: TListing[];
  currentUser: TCurrentUser;
  loadDataInProgress?: boolean;
  restaurants: TListing[];
  subOrderTxs: TTransaction[];
};

const OrderCalendarView: React.FC<TOrderCalendarViewProps> = (props) => {
  const {
    company,
    order,
    restaurants,
    currentUser,
    plans,
    loadDataInProgress,
    pickedFoods = [],
  } = props;
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { openRatingModal, subOrderDate, viewMode } = router.query;
  const pickedFoodsMapById = pickedFoods.reduce((acc, currentFood) => {
    const id = Listing(currentFood).getId();
    if (!acc.has(id)) {
      acc.set(id, currentFood);
    }

    return acc;
  }, new Map<string, TListing>());
  const companyTitle = User(company).getPublicData().displayName;
  const ensureCompanyUser = User(company).getFullData();
  const orderObj = Listing(order);
  const orderId = orderObj.getId();
  const { title: orderTitle } = orderObj.getAttributes();
  const orderColor = markColorForOrder(convertStringToNumber(orderTitle || ''));
  const currentUserId = CurrentUser(currentUser).getId();
  const selectedDay = useAppSelector((state) => state.Calendar.selectedDay);
  const ratingSubOrderModalControl = useBoolean();
  const successRatingModalControl = useBoolean();
  const {
    subOrderDetailModalControl,
    selectedEvent,
    setSelectedEvent,
    addSubOrderDocumentToFirebaseInProgress,
    participantPostRatingInProgress,
    updateSubOrderInProgress,
    updateOrderInProgress,
    pickFoodForSubOrdersInProgress,
    pickFoodForSpecificSubOrderInProgress,
  } = useSubOrderPicking();

  const {
    companyName = 'PCC',
    deadlineDate,
    deliveryHour,
    startDate,
    endDate,
    orderState,
    orderStateHistory = [],
    daySession = MORNING_SESSION,
  } = orderObj.getMetadata();
  const isOrderCanceled =
    orderState === EOrderStates.canceled ||
    orderState === EOrderStates.canceledByBooker;
  const [anchorTime, setAnchorTime] = useState<number | undefined>();

  const anchorDate =
    anchorTime || startDate ? new Date(anchorTime || startDate) : new Date();

  const allPlansIdList = plans?.map((plan) => Listing(plan).getId()) || [];
  const events = allPlansIdList.map((planId: string) => {
    const currentPlan = plans?.find(
      (plan) => Listing(plan).getId() === planId,
    ) as TListing;
    const currentPlanListing = Listing(currentPlan);

    const { orderDetail = {} } = currentPlanListing.getMetadata();
    const listEvent: Event[] = [];
    let isAnchorTimeChanged: any = false;

    Object.keys(orderDetail).forEach((planItemKey: string) => {
      const planItem = orderDetail[planItemKey];
      const { lastTransition } = planItem;
      const { foodList = {}, restaurantName, id } = planItem.restaurant;
      const restaurant = restaurants?.find(
        (_restaurant) => Listing(_restaurant).getId() === id,
      );
      const restaurantListing = Listing(restaurant!);
      const dishes = Object.keys(foodList).map((foodId: string) => ({
        key: foodId,
        value: foodList[foodId].foodName,
      }));

      const foodSelection =
        orderDetail[planItemKey].memberOrders[currentUserId] || {};

      const alreadyPickFood = !!foodSelection?.foodId;
      const pickedFoodDetail = pickedFoodsMapById.get(foodSelection?.foodId);

      const expiredTime = deadlineDate
        ? DateTime.fromMillis(+deadlineDate)
        : DateTime.fromMillis(+planItemKey).minus({ day: 2 });

      const pickFoodStatus = isOrderCanceled
        ? EVENT_STATUS.CANCELED_STATUS
        : alreadyPickFood
        ? EParticipantOrderStatus.joined
        : foodSelection?.status === EParticipantOrderStatus.notJoined
        ? EParticipantOrderStatus.notJoined
        : isOver(expiredTime.toMillis())
        ? EParticipantOrderStatus.expired
        : foodSelection?.status;

      if (!pickFoodStatus && !anchorTime && !isAnchorTimeChanged) {
        isAnchorTimeChanged = true;
        setAnchorTime(+planItemKey);
      }

      const event = {
        resource: {
          id: `${planItemKey}`,
          subOrderId: planId,
          orderId,
          timestamp: +planItemKey,
          daySession,
          status: pickFoodStatus,
          type: 'dailyMeal',
          restaurantAddress:
            restaurantListing.getPublicData().location?.address,
          restaurant: {
            name: restaurantName,
            id,
          },
          meal: {
            dishes,
          },
          pickedFoodDetail,
          deadlineDate,
          expiredTime: expiredTime.toMillis(),
          deliveryHour,
          dishSelection: { dishSelection: foodSelection?.foodId },
          orderColor,
          planId: currentPlanListing.getId(),
          orderState,
          companyName,
          lastTransition,
          foodName: dishes.find((_dish) => _dish.key === foodSelection?.foodId)
            ?.value,
          isOrderStarted:
            orderStateHistory.findIndex(
              (history: TObject) => history.state === EOrderStates.inProgress,
            ) !== -1,
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

  const recommendFoodForSubOrder = () => {
    const neededRecommendSubOrders = flattenEvents.reduce(
      (result: any, _event: Event) => {
        const { resource } = _event;
        const { status, dishSelection } = resource;
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
        recommendFrom: 'orderDetail',
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
        recommendFrom: 'orderDetail',
      }),
    );
  };

  const subOrdersFromSelectedDay = flattenEvents.filter((_event: any) =>
    isSameDate(_event.start, selectedDay),
  );

  const localStorageView = getItem('participant_calendarView');
  const isValidLocalStorageView = ['month', 'week'].includes(
    localStorageView as View,
  );
  const defaultView = viewMode
    ? viewMode
    : isValidLocalStorageView
    ? localStorageView
    : Views.WEEK;

  const sectionCompanyBranding = loadDataInProgress ? (
    <div className={css.sectionCompanyBranding}>
      <Skeleton className={css.avatarSkeleton} />
      <Skeleton className={css.companyTitleSkeleton} />
    </div>
  ) : (
    <div className={css.sectionCompanyBranding}>
      <Avatar disableProfileLink user={ensureCompanyUser as TUser} />
      <span className={css.companyTitle}>{companyTitle}</span>
    </div>
  );

  const showLoadingModal =
    updateOrderInProgress ||
    updateSubOrderInProgress ||
    addSubOrderDocumentToFirebaseInProgress ||
    participantPostRatingInProgress;

  const handleAnchorDateChange = (date?: Date) => {
    setAnchorTime(date?.getTime());
  };
  const closeAllModals = () => {
    subOrderDetailModalControl.setFalse();
    ratingSubOrderModalControl.setFalse();
    successRatingModalControl.setFalse();
  };

  useEffect(() => {
    if (selectedEvent) {
      const { timestamp, planId } = selectedEvent.resource;
      const subOrderId = `${currentUserId} - ${planId} - ${timestamp}`;
      dispatch(OrderListThunks.fetchSubOrdersFromFirebase(subOrderId));
    }
  }, [selectedEvent]);

  useEffect(() => {
    dispatch(CalendarActions.setSelectedDay(null));
  }, []);

  useEffect(() => {
    if (subOrderDate) {
      const selectedEventFromUrl = flattenEvents.find((_event: any) => {
        const { resource } = _event;
        const { timestamp } = resource;

        return subOrderDate === `${timestamp}`;
      });

      if (selectedEventFromUrl) {
        setSelectedEvent(selectedEventFromUrl);

        if (openRatingModal === 'true') {
          ratingSubOrderModalControl.setTrue();
        } else {
          dispatch(CalendarActions.setSelectedDay(new Date(+subOrderDate)));
        }
      }
    }
  }, [openRatingModal, subOrderDate]);

  return (
    <div className={css.container}>
      <div>
        <CalendarDashboard
          anchorDate={anchorDate}
          events={flattenEvents}
          companyLogo={sectionCompanyBranding}
          renderEvent={OrderEventCard}
          inProgress={loadDataInProgress}
          exposeAnchorDate={handleAnchorDateChange}
          defaultView={defaultView}
          components={{
            toolbar: (toolBarProps: any) => (
              <ParticipantToolbar
                {...toolBarProps}
                startDate={new Date(startDate)}
                endDate={new Date(endDate)}
                anchorDate={anchorDate}
                onPickForMe={recommendFoodForSubOrder}
                onPickForMeLoading={pickFoodForSubOrdersInProgress}
              />
            ),
          }}
          resources={{
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
      <RenderWhen condition={!!selectedEvent}>
        <SubOrderDetailModal
          isOpen={subOrderDetailModalControl.value}
          onClose={subOrderDetailModalControl.setFalse}
          event={selectedEvent!}
          openRatingSubOrderModal={ratingSubOrderModalControl.setTrue}
          from="orderDetail"
          recommendFoodForSpecificSubOrder={recommendFoodForSpecificSubOrder}
          pickFoodForSpecificSubOrderInProgress={
            pickFoodForSpecificSubOrderInProgress
          }
        />
        <RatingSubOrderModal
          isOpen={ratingSubOrderModalControl.value}
          onClose={ratingSubOrderModalControl.setFalse}
          selectedEvent={selectedEvent}
          currentUserId={currentUserId}
          openSuccessRatingModal={successRatingModalControl.setTrue}
        />
      </RenderWhen>

      <SuccessRatingModal
        isOpen={successRatingModalControl.value}
        onClose={successRatingModalControl.setFalse}
        closeAllModals={closeAllModals}
      />
      <BottomNavigationBar />
      <LoadingModal isOpen={showLoadingModal} />
    </div>
  );
};

export default OrderCalendarView;
