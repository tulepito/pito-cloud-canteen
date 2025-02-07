import { useState } from 'react';
import classNames from 'classnames';
import { DateTime } from 'luxon';

import { convertHHmmStringToTimeParts } from '@helpers/dateHelpers';
import { isOrderOverDeadline } from '@helpers/orderHelper';
import Tracker from '@helpers/tracker';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { useViewport } from '@hooks/useViewport';
import { totalFoodPickedWithParticipant } from '@pages/participant/helpers';
import { shoppingCartThunks } from '@redux/slices/shoppingCart.slice';
import type { RootState } from '@redux/store';
import { Listing } from '@src/utils/data';

import { ParticipantPlanThunks } from '../../plans/[planId]/ParticipantPlanPage.slice';

import DeleteCartModal from './DeleteCartModal';
import OrderPanelBody from './OrderPanelBody';
import OrderPanelFooter from './OrderPanelFooter';
import OrderPanelHeader from './OrderPanelHeader';
import SuccessModal from './SuccessModal';

import css from './SectionOrderPanel.module.scss';

type TSectionOrderPanelProps = {
  planId: string;
  orderId: string;
};

const SectionOrderPanel: React.FC<TSectionOrderPanelProps> = ({
  planId,
  orderId,
}) => {
  const cartList = useAppSelector((state: RootState) => {
    const { currentUser } = state.user;
    const currUserId = currentUser?.id?.uuid;

    return state.shoppingCart.orders?.[currUserId]?.[planId || 1];
  });
  const order = useAppSelector((state) => state.ParticipantPlanPage.order);
  const plan = useAppSelector((state) => state.ParticipantPlanPage.plan);
  const loadDataInProgress = useAppSelector(
    (state) => state.ParticipantPlanPage.loadDataInProgress,
  );
  const submitDataInprogress = useAppSelector(
    (state) => state.ParticipantPlanPage.submitDataInprogress,
  );

  const orderDays = Object.keys(plan);
  const cartListKeys = Object.keys(cartList || []).filter(
    (cartKey) => !!cartList[Number(cartKey)],
  );

  const isOrderDeadlineOver = isOrderOverDeadline(order);
  const { deadlineDate = Date.now(), deadlineHour } =
    Listing(order).getMetadata();
  const orderDeadline = DateTime.fromMillis(deadlineDate)
    .startOf('day')
    .plus({ ...convertHHmmStringToTimeParts(deadlineHour) })
    .toMillis();

  // Local state
  const [isOpenConfirmDeleteAll, setIsOpenConfirmDeleteAll] = useState(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);

  const dispatch = useAppDispatch();

  // Functions
  const handleRemoveItem = (dayId: string) => {
    dispatch(shoppingCartThunks.removeFromCart({ planId, dayId }));
  };

  const handleRemoveAllItem = () => {
    setIsOpenConfirmDeleteAll(true);
  };

  const handleSubmit = async () => {
    Tracker.track('participant:order:place', {
      orderId,
    });
    await dispatch(ParticipantPlanThunks.updateOrder({ orderId, planId }));
    setIsSubmitSuccess(true);
  };

  const handleConfirmDeleteAll = () => {
    dispatch(shoppingCartThunks.removeAllFromPlanCart({ planId }));
    setIsOpenConfirmDeleteAll(false);
    dispatch(ParticipantPlanThunks.updateOrder({ orderId, planId }));
  };

  const handleCloseConfirmDeleteAll = () => {
    setIsOpenConfirmDeleteAll(false);
  };

  const handleCloseSuccessModal = () => {
    setIsSubmitSuccess(false);
  };

  const handleAutoSelect = () => {
    Tracker.track('participant:foods:randomly-suggest', {
      orderId,
    });
    dispatch(ParticipantPlanThunks.recommendFoodSubOrders());
  };

  const orderDetailIds = Object.keys(plan ?? {});
  const { isMobileLayout } = useViewport();

  return (
    <div className={classNames(css.root, isMobileLayout ? 'mb-[180px]' : '')}>
      <OrderPanelHeader
        selectedDays={totalFoodPickedWithParticipant(orderDetailIds, cartList)}
        sumDays={orderDays.length}
      />
      <OrderPanelBody
        plan={plan}
        cartList={cartList}
        cartListKeys={cartListKeys}
        loadDataInProgress={loadDataInProgress}
        handleRemoveItem={handleRemoveItem}
        onAutoSelect={handleAutoSelect}
      />
      <OrderPanelFooter
        submitDataInprogress={submitDataInprogress}
        cartListKeys={cartListKeys}
        cartList={cartList}
        orderDetailIds={orderDetailIds}
        isOrderDeadlineOver={isOrderDeadlineOver}
        handleSubmit={handleSubmit}
        handleRemoveAllItem={handleRemoveAllItem}
      />
      <DeleteCartModal
        isOpen={isOpenConfirmDeleteAll}
        onClose={handleCloseConfirmDeleteAll}
        onCancel={handleCloseConfirmDeleteAll}
        onConfirm={handleConfirmDeleteAll}
      />
      {deadlineDate && (
        <SuccessModal
          isOpen={isSubmitSuccess}
          orderDeadline={orderDeadline}
          handleClose={handleCloseSuccessModal}
        />
      )}
    </div>
  );
};

export default SectionOrderPanel;
