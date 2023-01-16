// eslint-disable no-restricted-syntax
// eslint-disable-next-line import/no-named-as-default
import Avatar from '@components/Avatar/Avatar';
import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import OrderEventCard from '@components/CalendarDashboard/components/OrderEventCard/OrderEventCard';
import { CURRENT_USER, LISTING, USER } from '@utils/data';
import type { TCurrentUser, TListing, TUser } from '@utils/types';
import flatten from 'lodash/flatten';
import { DateTime } from 'luxon';
import React from 'react';
import type { Event } from 'react-big-calendar';
import Skeleton from 'react-loading-skeleton';

import css from './OrderCalendarView.module.scss';

type TOrderCalendarView = {
  company: TUser;
  order: TListing;
  plans?: TListing[];
  subOrders?: any;
  currentUser: TCurrentUser;
  loadDataInProgress?: boolean;
};

type TPlanItem = Record<string, any>;

const OrderCalendarView: React.FC<TOrderCalendarView> = (props) => {
  const { company, order, subOrders, currentUser, plans, loadDataInProgress } =
    props;

  const companyTitle = USER(company).getPublicData().displayName;
  const ensureCompanyUser = USER(company).getFullData();
  const orderId = LISTING(order).getId();
  const orderTile = LISTING(order).getAttributes().title;
  const currentUserId = CURRENT_USER(currentUser).getId();

  const { orderDeadline, deliveryHour } =
    LISTING(order).getMetadata().generalInfo || {};

  const events = subOrders.map((subOrder: any) => {
    const planKey = Object.keys(subOrder)[0];
    const planItem: TPlanItem = subOrder[planKey];
    const currentPlan = plans?.find(
      (plan) => LISTING(plan).getId() === planKey,
    ) as TListing;

    const listEvent: Event[] = [];

    Object.keys(planItem).forEach((planItemKey: string) => {
      const meal = planItem[planItemKey];
      const { foodList, restaurant } = meal;

      const dishes = foodList.map((food: TListing) => ({
        key: LISTING(food).getId(),
        value: LISTING(food).getAttributes().title,
      }));

      const foodSelection =
        LISTING(currentPlan).getMetadata().orderDetail[planItemKey]
          .memberOrders[currentUserId] || {};

      const event = {
        resource: {
          id: `${planItemKey}`,
          subOrderId: planKey,
          orderId,
          daySession: 'MORNING_SESSION',
          status: foodSelection?.status,
          type: 'dailyMeal',
          deliveryAddress: LISTING(restaurant).getPublicData().location,
          restaurant: {
            name: LISTING(restaurant).getAttributes().title,
            id: LISTING(restaurant).getId(),
          },
          meal: {
            dishes,
          },
          expiredTime: DateTime.fromMillis(+orderDeadline).toJSDate(),
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
  const flattenEvents = flatten(events);

  const sectionCompanyBranding = loadDataInProgress ? (
    <div className={css.sectionCompanyBranding}>
      <Skeleton className={css.avatarSkeleton} />
      <Skeleton className={css.companyTitleSkeleton} />
    </div>
  ) : (
    <div className={css.sectionCompanyBranding}>
      <Avatar disableProfileLink user={ensureCompanyUser} />
      <span className={css.companyTitle}>{companyTitle}</span>
    </div>
  );

  return (
    <div>
      <CalendarDashboard
        events={flattenEvents}
        companyLogo={sectionCompanyBranding}
        renderEvent={OrderEventCard}
        inProgress={loadDataInProgress}
      />
    </div>
  );
};
export default OrderCalendarView;
