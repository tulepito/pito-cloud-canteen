import React, { useState } from 'react';
import type { Event } from 'react-big-calendar';
import Skeleton from 'react-loading-skeleton';
import flatten from 'lodash/flatten';
import { DateTime } from 'luxon';

import Avatar from '@components/Avatar/Avatar';
import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import OrderEventCard from '@components/CalendarDashboard/components/OrderEventCard/OrderEventCard';
import { CurrentUser, Listing, User } from '@utils/data';
import type { TCurrentUser, TListing, TObject, TUser } from '@utils/types';

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
  const orderTile = orderObj.getAttributes().title;
  const currentUserId = CurrentUser(currentUser).getId();

  const { deadlineDate, deliveryHour, startDate } = orderObj.getMetadata();
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

      const event = {
        resource: {
          id: `${planItemKey}`,
          subOrderId: planKey,
          orderId,
          daySession: 'MORNING_SESSION',
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
          expiredTime: deadlineDate
            ? DateTime.fromMillis(+deadlineDate)
            : DateTime.fromMillis(+planItemKey).minus({ day: 2 }),
          deliveryHour,
          dishSelection: { dishSelection: foodSelection?.foodId },
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

  return (
    <div>
      <CalendarDashboard
        anchorDate={anchorDate}
        events={flattenEvents}
        companyLogo={sectionCompanyBranding}
        renderEvent={OrderEventCard}
        inProgress={loadDataInProgress}
      />
    </div>
  );
};

export default OrderCalendarView;
