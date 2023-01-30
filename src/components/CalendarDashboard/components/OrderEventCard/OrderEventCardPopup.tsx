import { InlineTextButton } from '@components/Button/Button';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { participantOrderManagementThunks } from '@redux/slices/ParticipantOrderManagementPage.slice';
import { currentUserSelector } from '@redux/slices/user.slice';
import { CURRENT_USER } from '@utils/data';
import { useRouter } from 'next/router';
import React from 'react';
import type { Event } from 'react-big-calendar';
import { FormattedMessage } from 'react-intl';

import type { TEventStatus } from '../../helpers/types';
import type { TDishSelectionFormValues } from './DishSelectionForm';
import DishSelectionForm from './DishSelectionForm';
import OrderEventCardContentItems from './OrderEventCardContentItems';
import css from './OrderEventCardPopup.module.scss';
import OrderEventCardStatus from './OrderEventCardStatus';

type TOrderEventCardPopupProps = {
  event: Event;
  status?: TEventStatus;
};

const OrderEventCardPopup: React.FC<TOrderEventCardPopupProps> = ({
  event,
  status,
}) => {
  const router = useRouter();
  const user = useAppSelector(currentUserSelector);

  const dispatch = useAppDispatch();
  const mealType = event.resource?.type;
  const startTime = event.resource?.deliveryHour;
  const dishes: any[] = event.resource?.meal?.dishes || [];
  const {
    orderId,
    subOrderId: planId,
    id: orderDay,
    dishSelection,
  } = event.resource;

  const onSelectDish = (values: TDishSelectionFormValues, reject?: boolean) => {
    const currentUserId = CURRENT_USER(user).getId();
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
    const to = `/participant/plans/${planId}?orderDay=${orderDay}`;
    router.push(to);
  };

  return (
    <div className={css.root}>
      <div className={css.header}>
        <div className={css.title}>#{event.title}</div>
        {status && <OrderEventCardStatus status={status} />}
      </div>
      <div className={css.mealType}>
        <FormattedMessage id={`EventCard.mealType.${mealType}`} />
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
