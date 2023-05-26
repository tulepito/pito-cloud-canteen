import React from 'react';
import type { Event } from 'react-big-calendar';
import { FormattedMessage, useIntl } from 'react-intl';
import { useRouter } from 'next/router';

import { InlineTextButton } from '@components/Button/Button';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { participantOrderManagementThunks } from '@redux/slices/ParticipantOrderManagementPage.slice';
import { currentUserSelector } from '@redux/slices/user.slice';
import { participantPaths } from '@src/paths';
import { CurrentUser } from '@utils/data';

import type { TEventStatus } from '../../helpers/types';

import type { TDishSelectionFormValues } from './DishSelectionForm';
import DishSelectionForm from './DishSelectionForm';
import OrderEventCardContentItems from './OrderEventCardContentItems';
import OrderEventCardStatus from './OrderEventCardStatus';

import css from './OrderEventCardPopup.module.scss';

type TOrderEventCardPopupProps = {
  event: Event;
  status?: TEventStatus;
  isExpired: boolean;
};

const OrderEventCardPopup: React.FC<TOrderEventCardPopupProps> = ({
  event,
  status,
  isExpired = false,
}) => {
  const router = useRouter();
  const intl = useIntl();
  const user = useAppSelector(currentUserSelector);

  const dispatch = useAppDispatch();
  const daySession = event.resource?.daySession;
  const startTime = event.resource?.deliveryHour;
  const dishes: any[] = event.resource?.meal?.dishes || [];
  const {
    orderId,
    subOrderId: planId,
    id: orderDay,
    dishSelection,
  } = event.resource;
  const timestamp =
    orderDay.split(' - ').length > 1 ? orderDay.split(' - ')[1] : orderDay;
  const from =
    router.pathname === participantPaths.OrderList
      ? 'orderList'
      : 'orderDetail';
  const onSelectDish = (values: TDishSelectionFormValues, reject?: boolean) => {
    const currentUserId = CurrentUser(user).getId();
    const payload = {
      updateValues: {
        orderId,
        orderDay,
        planId,
        memberOrders: {
          [currentUserId]: {
            status: reject ? 'notJoined' : 'joined',
            foodId: reject ? '' : values?.dishSelection,
          },
        },
      },
      orderId,
    };

    dispatch(participantOrderManagementThunks.updateOrder(payload));
  };

  const onNavigateToOrderDetail = () => {
    router.push({
      pathname: participantPaths.PlanDetail,
      query: { orderDay: timestamp, planId, from },
    });
  };

  return (
    <div className={css.root}>
      <div className={css.header}>
        <div className={css.title}>
          {intl.formatMessage({ id: `DayColumn.Session.${daySession}` })}
        </div>
        {status && <OrderEventCardStatus status={status} />}
      </div>
      <div className={css.mealType}>
        <span className={css.regularText}>#{event.title}</span> |{' '}
        {intl.formatMessage({ id: 'EventCard.PCC' })}
      </div>
      <div className={css.eventTime}>{startTime}</div>
      <div className={css.divider} />
      <OrderEventCardContentItems event={event} isFirstHighlight />
      <div className={css.divider} />
      <div className={css.selectFoodForm}>
        <div className={css.selectFoodHeader}>
          <div className={css.formTitle}>
            <FormattedMessage id="EventCard.form.selectFood" />
          </div>
          <InlineTextButton
            className={css.viewDetail}
            onClick={onNavigateToOrderDetail}>
            <FormattedMessage id="EventCard.form.viewDetail" />
          </InlineTextButton>
        </div>
        <div className={css.selectDishContent}>
          <DishSelectionForm
            actionsDisabled={isExpired}
            dishes={dishes}
            onSubmit={onSelectDish}
            initialValues={dishSelection}
          />
        </div>
      </div>
    </div>
  );
};

export default OrderEventCardPopup;
