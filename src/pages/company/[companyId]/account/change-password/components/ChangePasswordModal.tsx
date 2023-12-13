import { useIntl } from 'react-intl';

import Alert, { EAlertPosition, EAlertType } from '@components/Alert/Alert';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import Modal from '@components/Modal/Modal';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { passwordThunks } from '@redux/slices/password.slice';

import type { TChangePasswordFormValues } from './ChangePasswordForm';
import ChangePasswordForm from './ChangePasswordForm';

import css from './ChangePasswordModal.module.scss';

type TNavigationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ChangePasswordModal: React.FC<TNavigationModalProps> = (props) => {
  const { isOpen, onClose } = props;
  const changePasswordSuccessModalControl = useBoolean();
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const changePasswordInProgress = useAppSelector(
    (state) => state.password.changePasswordInProgress,
  );

  const handleSubmit = async (values: TChangePasswordFormValues) => {
    const { password, newPassword } = values;
    const { meta } = await dispatch(
      passwordThunks.changePassword({
        currentPassword: password,
        newPassword,
      }),
    );
    if (meta.requestStatus === 'fulfilled') {
      changePasswordSuccessModalControl.setTrue();
    }
  };

  const handleCloseSuccessModal = () => {
    changePasswordSuccessModalControl.setFalse();
  };

  return (
    <Modal
      isOpen={isOpen}
      className={css.root}
      handleClose={() => {}}
      containerClassName={css.modalContainer}
      headerClassName={css.modalHeader}
      shouldHideIconClose>
      <div>
        <div className={css.heading}>
          <IconArrow direction="left" onClick={onClose} />
          <div>
            {intl.formatMessage({
              id: 'CompanySidebar.passwordSetting',
            })}
          </div>
        </div>

        <ChangePasswordForm
          onSubmit={handleSubmit}
          inProgress={changePasswordInProgress}
        />

        <Alert
          message={intl.formatMessage({
            id: 'AdminAccountSetting.submitPasswordSuccess',
          })}
          isOpen={changePasswordSuccessModalControl.value}
          autoClose
          onClose={handleCloseSuccessModal}
          type={EAlertType.success}
          hasCloseButton={false}
          position={EAlertPosition.bottomLeft}
          messageClassName={css.alertMessage}
        />
      </div>
    </Modal>
  );
};

export default ChangePasswordModal;
