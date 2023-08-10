import React from 'react';
import type { Event } from 'react-big-calendar';
import { FormattedMessage, useIntl } from 'react-intl';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';

import Button, { InlineTextButton } from '@components/Button/Button';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { OrderListThunks } from '@pages/participant/orders/OrderList.slice';
import { participantOrderManagementThunks } from '@redux/slices/ParticipantOrderManagementPage.slice';
import { currentUserSelector } from '@redux/slices/user.slice';
import { participantPaths } from '@src/paths';
import { EOrderStates, EParticipantOrderStatus } from '@src/utils/enums';
import { txIsDelivered } from '@src/utils/transaction';
import type { TTransaction } from '@src/utils/types';
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
  subOrderDocument: any;
  subOrderTx?: TTransaction;
  fetchSubOrderTxInProgress: boolean;
  fetchSubOrderDocumentInProgress: boolean;
  openRatingSubOrderModal: () => void;
};

const OrderEventCardPopup: React.FC<TOrderEventCardPopupProps> = ({
  event,
  status,
  isExpired = false,
  subOrderDocument,
  subOrderTx,
  fetchSubOrderTxInProgress,
  fetchSubOrderDocumentInProgress,
  openRatingSubOrderModal,
}) => {
  const router = useRouter();
  const intl = useIntl();
  const user = useAppSelector(currentUserSelector);
  const dispatch = useAppDispatch();

  const dishes: any[] = event.resource?.meal?.dishes || [];
  const {
    orderId,
    subOrderId: planId,
    id: orderDay,
    dishSelection,
    transactionId,
    daySession,
    deliveryHour: startTime,
    isOrderStarted = false,
    orderState,
  } = event.resource;
  const isOrderCancelled = orderState === EOrderStates.canceled;

  const shouldShowPickFoodSection =
    !isOrderStarted &&
    !isExpired &&
    isEmpty(transactionId) &&
    !isOrderCancelled;
  const timestamp =
    orderDay.split(' - ').length > 1 ? orderDay.split(' - ')[1] : orderDay;
  const from =
    router.pathname === participantPaths.OrderList
      ? 'orderList'
      : 'orderDetail';

  const { reviewId } = subOrderDocument;

  const onSelectDish = async (
    values: TDishSelectionFormValues,
    reject?: boolean,
  ) => {
    const currentUserId = CurrentUser(user).getId();
    const payload = {
      updateValues: {
        orderId,
        orderDay: timestamp,
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

    if (from === 'orderList') {
      await dispatch(OrderListThunks.updateSubOrder(payload));
    } else {
      await dispatch(participantOrderManagementThunks.updateOrder(payload));
    }
    dispatch(
      OrderListThunks.addSubOrderDocumentToFirebase({
        participantId: currentUserId,
        planId,
        timestamp: parseInt(`${timestamp}`, 10),
      }),
    );
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
      <RenderWhen condition={shouldShowPickFoodSection}>
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
      </RenderWhen>
      <RenderWhen
        condition={
          !reviewId &&
          txIsDelivered(subOrderTx as TTransaction) &&
          status === EParticipantOrderStatus.joined
        }>
        <div className={css.ratingWrapper}>
          <Button
            disabled={
              fetchSubOrderTxInProgress || fetchSubOrderDocumentInProgress
            }
            className={css.ratingBtn}
            onClick={openRatingSubOrderModal}>
            Đánh giá
          </Button>
        </div>
      </RenderWhen>
    </div>
  );
};

export default OrderEventCardPopup;
