import AlertModal from '@components/Modal/AlertModal';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { ParticipantSetupPlanThunks } from '@redux/slices/ParticipantSetupPlanPage.slice';
import { shopingCartThunks } from '@redux/slices/shopingCart.slice';
import { useState } from 'react';
import { useIntl } from 'react-intl';

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
  const intl = useIntl();

  const cartList = useAppSelector((state: any) => {
    const { currentUser } = state.user;
    const currUserId = currentUser?.id?.uuid;
    return state.shopingCart.orders?.[currUserId]?.[planId || 1];
  });
  const plan = useAppSelector((state) => state.ParticipantSetupPlanPage.plan);
  const orderDays = Object.keys(plan);
  const loadDataInProgress = useAppSelector(
    (state) => state.ParticipantSetupPlanPage.loadDataInProgress,
  );
  const submitDataInprogress = useAppSelector(
    (state) => state.ParticipantSetupPlanPage.submitDataInprogress,
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
    await dispatch(ParticipantSetupPlanThunks.updateOrder({ orderId, planId }));
    setIsSubmitSuccess(true);
  };

  const handleConfirmDeleteAll = () => {
    dispatch(shopingCartThunks.removeAllFromPlanCart({ planId }));
    setIsOpenConfirmDeleteAll(false);
    dispatch(ParticipantSetupPlanThunks.updateOrder({ orderId, planId }));
  };

  const handleCloseConfirmDeleteAll = () => {
    setIsOpenConfirmDeleteAll(false);
  };

  const handleCloseSuccessModal = () => {
    setIsSubmitSuccess(false);
  };

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
      />
      <OrderPanelFooter
        submitDataInprogress={submitDataInprogress}
        cartListKeys={cartListKeys}
        handleSubmit={handleSubmit}
        handleRemoveAllItem={handleRemoveAllItem}
      />
      <AlertModal
        isOpen={isOpenConfirmDeleteAll}
        handleClose={handleCloseConfirmDeleteAll}
        title={intl.formatMessage({
          id: 'SectionOrderPanel.Alert.confirmDeleteTitle',
        })}
        cancelLabel={intl.formatMessage({
          id: 'SectionOrderPanel.Alert.cancelDeleteBtn',
        })}
        confirmLabel={intl.formatMessage({
          id: 'SectionOrderPanel.Alert.confirmDeleteBtn',
        })}
        onCancel={handleCloseConfirmDeleteAll}
        onConfirm={handleConfirmDeleteAll}>
        {intl.formatMessage({
          id: 'SectionOrderPanel.Alert.confirmDeleteMessage',
        })}
      </AlertModal>
      <SuccessModal
        isOpen={isSubmitSuccess}
        handleClose={handleCloseSuccessModal}
      />
    </div>
  );
};

export default SectionOrderPanel;
