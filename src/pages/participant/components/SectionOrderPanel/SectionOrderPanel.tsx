import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { shopingCartThunks } from '@redux/slices/shopingCart.slice';
import { useState } from 'react';

import { ParticipantPlanThunks } from '../../plans/[planId]/ParticipantPlanPage.slice';
import DeleteCartModal from './DeleteCartModal';
import OrderPanelBody from './OrderPanelBody';
import OrderPanelFooter from './OrderPanelFooter';
import OrderPanelHeader from './OrderPanelHeader';
import css from './SectionOrderPanel.module.scss';
import SuccessModal from './SuccessModal';

type TSectionOrderPanelProps = {
  planId: string;
  orderId: string;
};

const SectionOrderPanel: React.FC<TSectionOrderPanelProps> = ({
  planId,
  orderId,
}) => {
  const cartList = useAppSelector((state: any) => {
    const { currentUser } = state.user;
    const currUserId = currentUser?.id?.uuid;
    return state.shopingCart.orders?.[currUserId]?.[planId || 1];
  });
  const plan = useAppSelector((state) => state.ParticipantPlanPage.plan);
  const orderDays = Object.keys(plan);
  const loadDataInProgress = useAppSelector(
    (state) => state.ParticipantPlanPage.loadDataInProgress,
  );
  const submitDataInprogress = useAppSelector(
    (state) => state.ParticipantPlanPage.submitDataInprogress,
  );

  const cartListKeys = Object.keys(cartList || []).filter(
    (cartKey) => !!cartList[cartKey],
  );

  // Local state
  const [isOpenConfirmDeleteAll, setIsOpenConfirmDeleteAll] = useState(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);

  const dispatch = useAppDispatch();

  // Functions
  const handleRemoveItem = (dayId: string) => {
    dispatch(shopingCartThunks.removeFromCart({ planId, dayId }));
  };

  const handleRemoveAllItem = () => {
    setIsOpenConfirmDeleteAll(true);
  };

  const handleSubmit = async () => {
    await dispatch(ParticipantPlanThunks.updateOrder({ orderId, planId }));
    setIsSubmitSuccess(true);
  };

  const handleConfirmDeleteAll = () => {
    dispatch(shopingCartThunks.removeAllFromPlanCart({ planId }));
    setIsOpenConfirmDeleteAll(false);
    dispatch(ParticipantPlanThunks.updateOrder({ orderId, planId }));
  };

  const handleCloseConfirmDeleteAll = () => {
    setIsOpenConfirmDeleteAll(false);
  };

  const handleCloseSuccessModal = () => {
    setIsSubmitSuccess(false);
  };

  const handleAutoSelect = () => {};

  return (
    <div className={css.root}>
      <OrderPanelHeader
        selectedDays={cartListKeys.length}
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
        handleSubmit={handleSubmit}
        handleRemoveAllItem={handleRemoveAllItem}
      />
      <DeleteCartModal
        isOpen={isOpenConfirmDeleteAll}
        onClose={handleCloseConfirmDeleteAll}
        onCancel={handleCloseConfirmDeleteAll}
        onConfirm={handleConfirmDeleteAll}
      />
      <SuccessModal
        isOpen={isSubmitSuccess}
        handleClose={handleCloseSuccessModal}
      />
    </div>
  );
};

export default SectionOrderPanel;
