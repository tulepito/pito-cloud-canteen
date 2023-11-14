import AlertModal from '@components/Modal/AlertModal';

import ConfirmNotifyUserForm from './ConfirmNotifyUserForm';

import css from './ConfirmNotifyUserModal.module.scss';

type TConfirmNotifyUserModalProps = {
  isOpen: boolean;
  confirmDisabled: boolean;
  onClose: () => void;
  onCancel: () => void;
  onConfirm: () => void;
  shouldHideParticipantOption: boolean;
  setUserRoles: (value: string[]) => void;
  initialValues: any;
};

const ConfirmNotifyUserModal: React.FC<TConfirmNotifyUserModalProps> = (
  props,
) => {
  const {
    shouldHideParticipantOption,
    isOpen,
    onCancel,
    confirmDisabled,
    onConfirm,
    onClose,
    setUserRoles,
    initialValues,
  } = props;

  return (
    <div className={css.root}>
      <AlertModal
        containerClassName={css.modalContainer}
        title="Thông báo thay đổi"
        isOpen={isOpen}
        handleClose={onClose}
        onCancel={onCancel}
        cancelLabel="Bỏ qua"
        onConfirm={onConfirm}
        confirmLabel="Gửi thông báo"
        confirmDisabled={confirmDisabled}
        childrenClassName={css.modalChildrenContainer}>
        <div>Chọn đối tượng để gửi thông báo thay đổi về đơn hàng</div>
        <ConfirmNotifyUserForm
          initialValues={initialValues}
          setUserRoles={setUserRoles}
          shouldHideParticipantOption={shouldHideParticipantOption}
          onSubmit={() => {}}
        />
      </AlertModal>
    </div>
  );
};

export default ConfirmNotifyUserModal;
