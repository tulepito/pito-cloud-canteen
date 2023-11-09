import PopupModal from '@components/PopupModal/PopupModal';
import { useAppSelector } from '@hooks/reduxHooks';

import SelectRoleToSendNotificationForm from '../SelectRoleToSendNotificationForm/SelectRoleToSendNotificationForm';

import css from './EditConfirmModal.module.scss';

type TEditConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  isNormalOrder?: boolean;
};

const EditConfirmModal: React.FC<TEditConfirmModalProps> = (props) => {
  const { isOpen, onClose, onSubmit, isNormalOrder } = props;
  const updateOrderInProgress = useAppSelector(
    (state) => state.Order.updateOrderInProgress,
  );
  const updatePlanInProgress = useAppSelector(
    (state) => state.Order.updateOrderDetailInProgress,
  );

  return (
    <PopupModal
      id="EditConfirmModal"
      isOpen={isOpen}
      handleClose={onClose}
      title="Gửi cập nhật thay đổi đến"
      containerClassName={css.root}>
      <SelectRoleToSendNotificationForm
        onSubmit={onSubmit}
        inProgress={updateOrderInProgress || updatePlanInProgress}
        isNormalOrder={isNormalOrder}
      />
    </PopupModal>
  );
};

export default EditConfirmModal;
