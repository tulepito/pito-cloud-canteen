import { useMemo } from 'react';

import IconArrowHead from '@components/Icons/IconArrowHead/IconArrowHead';
import Modal from '@components/Modal/Modal';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';

import { AccountThunks } from '../../Account.slice';
import type { TChangePasswordFormValues } from '../ChangePasswordForm/ChangePasswordForm';
import ChangePasswordForm from '../ChangePasswordForm/ChangePasswordForm';

import css from './ChangePasswordModal.module.scss';

type TChangePasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
};
const ChangePasswordModal: React.FC<TChangePasswordModalProps> = (props) => {
  const { isOpen, onClose } = props;
  const dispatch = useAppDispatch();

  const changePasswordInProgress = useAppSelector(
    (state) => state.ParticipantAccount.changePasswordInProgress,
  );

  const initialValues = useMemo(
    () => ({ password: '', newPassword: '', confirmPassword: '' }),
    [],
  );

  const handleSubmit = async (values: TChangePasswordFormValues) => {
    const { password, newPassword } = values;
    await dispatch(
      AccountThunks.changePassword({
        currentPassword: password,
        newPassword,
      }),
    );
  };

  return (
    <Modal
      id="ChangePasswordModal"
      isOpen={isOpen}
      handleClose={onClose}
      className={css.modal}
      closeClassName={css.closedModal}
      containerClassName={css.modalContainer}
      shouldHideIconClose>
      <div className={css.modalHeader}>
        <div className={css.goBackContainer} onClick={onClose}>
          <IconArrowHead direction="left" />
          <span className={css.goBack}></span>
          Quay lại
        </div>
        <div className={css.modalTitle}>Tài khoản cá nhân</div>
      </div>
      <div className={css.modalContent}>
        <ChangePasswordForm
          onSubmit={handleSubmit}
          initialValues={initialValues}
          inProgress={changePasswordInProgress}
        />
      </div>
    </Modal>
  );
};

export default ChangePasswordModal;
