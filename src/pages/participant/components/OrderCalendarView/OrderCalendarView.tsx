import React, { useEffect, useState } from 'react';
import type { Event, View } from 'react-big-calendar';
import { Views } from 'react-big-calendar';
import Skeleton from 'react-loading-skeleton';
import flatten from 'lodash/flatten';
import { DateTime } from 'luxon';

import Avatar from '@components/Avatar/Avatar';
import BottomNavigationBar from '@components/BottomNavigationBar/BottomNavigationBar';
import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import OrderEventCard from '@components/CalendarDashboard/components/OrderEventCard/OrderEventCard';
import { EVENT_STATUS } from '@components/CalendarDashboard/helpers/constant';
import LoadingModal from '@components/LoadingModal/LoadingModal';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { getItem } from '@helpers/localStorageHelpers';
import { isOver, markColorForOrder } from '@helpers/orderHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import useSubOrderPicking from '@pages/participant/hooks/useSubOrderPicking';
import RatingSubOrderModal from '@pages/participant/orders/components/RatingSubOrderModal/RatingSubOrderModal';
import SubOrderCard from '@pages/participant/orders/components/SubOrderCard/SubOrderCard';
import SubOrderDetailModal from '@pages/participant/orders/components/SubOrderDetailModal/SubOrderDetailModal';
import SuccessRatingModal from '@pages/participant/orders/components/SuccessRatingModal/SuccessRatingModal';
import { OrderListThunks } from '@pages/participant/orders/OrderList.slice';
import { getDaySessionFromDeliveryTime, isSameDate } from '@src/utils/dates';
import { EOrderStates, EParticipantOrderStatus } from '@src/utils/enums';
import { convertStringToNumber } from '@src/utils/number';
import { CurrentUser, Listing, User } from '@utils/data';
import type { TCurrentUser, TListing, TTransaction, TUser } from '@utils/types';

import ParticipantToolbar from '../ParticipantToolbar/ParticipantToolbar';

import css from './OrderCalendarView.module.scss';

type TOrderCalendarViewProps = {
  company: TUser;
  order: TListing;
  plans?: TListing[];
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
  } = props;
  const dispatch = useAppDispatch();

  const companyTitle = User(company).getPublicData().displayName;
  const ensureCompanyUser = User(company).getFullData();
  const orderObj = Listing(order);
  const orderId = orderObj.getId();
  const { companyName = 'PCC' } = orderObj.getMetadata();
  const orderTitle = orderObj.getAttributes()?.title;
  const orderColor = markColorForOrder(convertStringToNumber(orderTitle || ''));
  const currentUserId = CurrentUser(currentUser).getId();
  const selectedDay = useAppSelector((state) => state.Calendar.selectedDay);
  const ratingSubOrderModalControl = useBoolean();
  const successRatingModalControl = useBoolean();
  const {
    subOrderDetailModalControl,
    selectedEvent,
    setSelectedEvent,
    onRejectSelectDish,
    addSubOrderDocumentToFirebaseInProgress,
    participantPostRatingInProgress,
    updateSubOrderInProgress,
    updateOrderInProgress,
  } = useSubOrderPicking();

  const { deadlineDate, deliveryHour, startDate, endDate, orderState } =
    orderObj.getMetadata();
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

      const expiredTime = deadlineDate
        ? DateTime.fromMillis(+deadlineDate)
        : DateTime.fromMillis(+planItemKey).minus({ day: 2 });

      const pickFoodStatus = isOrderCanceled
        ? EVENT_STATUS.CANCELED_STATUS
        : alreadyPickFood
        ? EParticipantOrderStatus.joined
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
          daySession: getDaySessionFromDeliveryTime(deliveryHour),
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

  const localStorageView = getItem('participant_calendarView');
  const isValidLocalStorageView = ['month', 'week'].includes(
    localStorageView as View,
  );
  const defaultView = isValidLocalStorageView ? localStorageView : Views.WEEK;

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
          defautlView={defaultView}
          components={{
            toolbar: (toolBarProps: any) => (
              <ParticipantToolbar
                {...toolBarProps}
                startDate={new Date(startDate)}
                endDate={new Date(endDate)}
                anchorDate={anchorDate}
              />
            ),
          }}
          resources={{ setSelectedEvent }}
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
      <RenderWhen condition={!!selectedEvent}>
        <SubOrderDetailModal
          isOpen={subOrderDetailModalControl.value}
          onClose={subOrderDetailModalControl.setFalse}
          event={selectedEvent!}
          openRatingSubOrderModal={ratingSubOrderModalControl.setTrue}
          from="orderDetail"
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
