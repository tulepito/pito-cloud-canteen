import { useEffect, useMemo } from 'react';
import type { Event } from 'react-big-calendar';
import { FormattedMessage, useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import last from 'lodash/last';
import { useRouter } from 'next/router';

import Button, { InlineTextButton } from '@components/Button/Button';
import type { TDishSelectionFormValues } from '@components/CalendarDashboard/components/OrderEventCard/DishSelectionForm';
import DishSelectionForm from '@components/CalendarDashboard/components/OrderEventCard/DishSelectionForm';
import OrderEventCardContentItems from '@components/CalendarDashboard/components/OrderEventCard/OrderEventCardContentItems';
import OrderEventCardStatus from '@components/CalendarDashboard/components/OrderEventCard/OrderEventCardStatus';
import { EVENT_STATUS } from '@components/CalendarDashboard/helpers/constant';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import SlideModal from '@components/SlideModal/SlideModal';
import { isOver } from '@helpers/orderHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { currentUserSelector } from '@redux/slices/user.slice';
import { participantPaths } from '@src/paths';
import { CurrentUser } from '@src/utils/data';
import { txIsDelivered, txIsInitiated } from '@src/utils/transaction';
import type { TTransaction } from '@src/utils/types';

import { OrderListThunks } from '../../OrderList.slice';

import css from './SubOrderDetailModal.module.scss';

type TSubOrderDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  openRatingSubOrderModal: () => void;
};

const SubOrderDetailModal: React.FC<TSubOrderDetailModalProps> = (props) => {
  const { isOpen, onClose, event, openRatingSubOrderModal } = props;
  const intl = useIntl();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    orderId,
    subOrderId: planId,
    id: orderDay,
    dishSelection,
    status,
    expiredTime,
    daySession,
    deliveryHour: startTime,
    transactionId,
  } = event.resource;
  const dishes: any[] = event.resource?.meal?.dishes || [];
  const user = useAppSelector(currentUserSelector);
  const subOrderTxs = useAppSelector(
    (state) => state.ParticipantOrderList.subOrderTxs,
    shallowEqual,
  );

  const fetchSubOrderTxInProgress = useAppSelector(
    (state) => state.ParticipantOrderList.fetchSubOrderTxInProgress,
  );
  const subOrderDocument = useAppSelector(
    (state) => state.ParticipantOrderList.subOrderDocument,
    shallowEqual,
  );
  const timestamp = last(orderDay.split(' - '));
  const subOrderTx = useMemo(
    () => subOrderTxs.find((tx) => tx.id.uuid === transactionId),
    [subOrderTxs, transactionId],
  );
  const isTxInitialState = txIsInitiated(subOrderTx as TTransaction);

  const isExpired = isOver(expiredTime);
  const dishSelectionFormInitialValues = useMemo(
    () => dishSelection,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(dishSelection)],
  );

  const { reviewId } = subOrderDocument;
  useEffect(() => {
    if (isOpen) {
      dispatch(OrderListThunks.fetchTransactionBySubOrder([transactionId]));
    }
  }, [dispatch, isOpen, transactionId]);
  const onNavigateToOrderDetail = () => {
    router.push({
      pathname: participantPaths.PlanDetail,
      query: { orderDay: timestamp as string, planId, from: 'orderList' },
    });
  };

  const onSelectDish = async (
    values: TDishSelectionFormValues,
    reject?: boolean,
  ) => {
    const currentUserId = CurrentUser(user).getId();
    const payload = {
      updateValues: {
        orderId,
        orderDay: last(orderDay.split(' - ')),
        planId,
        memberOrders: {
          [currentUserId]: {
            status: reject
              ? EVENT_STATUS.NOT_JOINED_STATUS
              : EVENT_STATUS.JOINED_STATUS,
            foodId: reject ? '' : values?.dishSelection,
          },
        },
      },
      orderId,
    };

    await dispatch(OrderListThunks.updateSubOrder(payload));
    await dispatch(
      OrderListThunks.addSubOrderDocumentToFirebase({
        participantId: currentUserId,
        planId,
        timestamp: parseInt(`${timestamp}`, 10),
      }),
    );
    onClose();
  };

  return (
    <SlideModal
      id="SubOrderDetailModal"
      isOpen={isOpen}
      onClose={onClose}
      modalTitle="Chi tiết đơn hàng">
      <div className={css.root}>
        <div className={css.header}>
          <div className={css.title}>
            {intl.formatMessage({ id: `DayColumn.Session.${daySession}` })}
          </div>
          {status && (
            <OrderEventCardStatus status={status} subOrderTx={subOrderTx} />
          )}
        </div>
        <div className={css.mealType}>
          <span className={css.regularText}>#{event.title}</span> |{' '}
          {intl.formatMessage({ id: 'EventCard.PCC' })}
        </div>
        <div className={css.eventTime}>{startTime}</div>
        <div className={css.divider} />
        <OrderEventCardContentItems event={event} isFirstHighlight />
        <RenderWhen condition={!subOrderTx || (subOrderTx && isTxInitialState)}>
          <RenderWhen condition={fetchSubOrderTxInProgress}>
            <div className={css.loading}>Đang tải</div>
            <RenderWhen.False>
              <>
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
                      subOrderStatus={status}
                      initialValues={dishSelectionFormInitialValues}
                    />
                  </div>
                </div>
              </>
            </RenderWhen.False>
          </RenderWhen>
        </RenderWhen>
        <RenderWhen
          condition={!reviewId && txIsDelivered(subOrderTx as TTransaction)}>
          <Button className={css.ratingBtn} onClick={openRatingSubOrderModal}>
            Đánh giá
          </Button>
        </RenderWhen>
      </div>
    </SlideModal>
  );
};
export default SubOrderDetailModal;
