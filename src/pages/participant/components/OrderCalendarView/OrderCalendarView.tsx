import React, { useState } from 'react';
import type { Event } from 'react-big-calendar';
import Skeleton from 'react-loading-skeleton';
import flatten from 'lodash/flatten';
import { DateTime } from 'luxon';

import Avatar from '@components/Avatar/Avatar';
import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import OrderEventCard from '@components/CalendarDashboard/components/OrderEventCard/OrderEventCard';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { markColorForOrder } from '@helpers/orderHelper';
import { useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import useSubOrderPicking from '@pages/participant/hooks/useSubOrderPicking';
import RatingSubOrderModal from '@pages/participant/orders/components/RatingSubOrderModal/RatingSubOrderModal';
import SubOrderCard from '@pages/participant/orders/components/SubOrderCard/SubOrderCard';
import SubOrderDetailModal from '@pages/participant/orders/components/SubOrderDetailModal/SubOrderDetailModal';
import SuccessRatingModal from '@pages/participant/orders/components/SuccessRatingModal/SuccessRatingModal';
import { getDaySessionFromDeliveryTime, isSameDate } from '@src/utils/dates';
import { convertStringToNumber } from '@src/utils/number';
import { CurrentUser, Listing, User } from '@utils/data';
import type { TCurrentUser, TListing, TObject, TUser } from '@utils/types';

import ParticipantToolbar from '../ParticipantToolbar/ParticipantToolbar';

import css from './OrderCalendarView.module.scss';

type TOrderCalendarViewProps = {
  company: TUser;
  order: TListing;
  plans?: TListing[];
  subOrders?: any;
  currentUser: TCurrentUser;
  loadDataInProgress?: boolean;
};

type TPlanItem = TObject;

const OrderCalendarView: React.FC<TOrderCalendarViewProps> = (props) => {
  const { company, order, subOrders, currentUser, plans, loadDataInProgress } =
    props;

  const companyTitle = User(company).getPublicData().displayName;
  const ensureCompanyUser = User(company).getFullData();
  const orderObj = Listing(order);
  const orderId = orderObj.getId();
  const orderTile = orderObj.getAttributes()?.title;
  const orderColor = markColorForOrder(convertStringToNumber(orderTile || ''));
  const currentUserId = CurrentUser(currentUser).getId();
  const selectedDay = useAppSelector((state) => state.Calendar.selectedDay);
  const ratingSubOrderModalControl = useBoolean();
  const successRatingModalControl = useBoolean();
  const {
    subOrderDetailModalControl,
    selectedEvent,
    setSelectedEvent,
    onRejectSelectDish,
  } = useSubOrderPicking();

  const { deadlineDate, deliveryHour, startDate, endDate } =
    orderObj.getMetadata();
  const [anchorTime, setAnchorTime] = useState<number | undefined>();

  const anchorDate =
    anchorTime || startDate ? new Date(anchorTime || startDate) : new Date();

  const events = subOrders.map((subOrder: any) => {
    const planKey = Object.keys(subOrder)[0];
    const planItem: TPlanItem = subOrder[planKey];
    const currentPlan = plans?.find(
      (plan) => Listing(plan).getId() === planKey,
    ) as TListing;

    const listEvent: Event[] = [];
    let isAnchorTimeChanged: any = false;

    Object.keys(planItem).forEach((planItemKey: string) => {
      const meal = planItem[planItemKey];
      const { restaurant = {}, foodList = [] } = meal;

      const dishes = foodList.map((food: TListing) => ({
        key: Listing(food).getId(),
        value: Listing(food).getAttributes().title,
      }));

      const foodSelection =
        Listing(currentPlan).getMetadata().orderDetail[planItemKey]
          .memberOrders[currentUserId] || {};

      const pickFoodStatus = foodSelection?.status;

      if (!pickFoodStatus && !anchorTime && !isAnchorTimeChanged) {
        isAnchorTimeChanged = true;
        setAnchorTime(+planItemKey);
      }
      const expiredTime = deadlineDate
        ? DateTime.fromMillis(+deadlineDate)
        : DateTime.fromMillis(+planItemKey).minus({ day: 2 });

      const event = {
        resource: {
          id: `${planItemKey}`,
          subOrderId: planKey,
          orderId,
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
          expiredTime: expiredTime.toMillis(),
          deliveryHour,
          dishSelection: { dishSelection: foodSelection?.foodId },
          orderColor,
        },
        title: orderTile,
        start: DateTime.fromMillis(+planItemKey).toJSDate(),
        end: DateTime.fromMillis(+planItemKey).plus({ hour: 1 }).toJSDate(),
      };

      listEvent.push(event);
    });

    return listEvent;
  });
  const flattenEvents = flatten<Event>(events);
  console.log('flattenEvents', flattenEvents);
  const subOrdersFromSelectedDay = flattenEvents.filter((_event: any) =>
    isSameDate(_event.start, selectedDay),
  );

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

  const handleAnchorDateChange = (date?: Date) => {
    setAnchorTime(date?.getTime());
  };

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
      />
    </div>
  );
};

export default OrderCalendarView;
