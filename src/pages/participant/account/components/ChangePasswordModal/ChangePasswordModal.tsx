import { useIntl } from 'react-intl';

import IconArrowHead from '@components/Icons/IconArrowHead/IconArrowHead';
import Modal from '@components/Modal/Modal';
import { useAppSelector } from '@hooks/reduxHooks';

import type { TChangePasswordFormValues } from '../ChangePasswordForm/ChangePasswordForm';
import ChangePasswordForm from '../ChangePasswordForm/ChangePasswordForm';

import css from './ChangePasswordModal.module.scss';

type TChangePasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
  handleSubmit: (values: TChangePasswordFormValues) => void;
  initialValues: TChangePasswordFormValues;
};
const ChangePasswordModal: React.FC<TChangePasswordModalProps> = (props) => {
  const { isOpen, onClose, handleSubmit, initialValues } = props;
  const intl = useIntl();

  const changePasswordInProgress = useAppSelector(
    (state) => state.password.changePasswordInProgress,
  );

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
          {intl.formatMessage({
            id: 'booker.orders.draft.foodDetailModal.back',
          })}
        </div>
        <div className={css.modalTitle}>
          {intl.formatMessage({
            id: 'ParticipantChangePasswordRoute.description',
          })}
        </div>
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
