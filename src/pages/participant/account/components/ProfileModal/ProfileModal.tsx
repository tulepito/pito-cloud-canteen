import { useMemo } from 'react';

import ConfirmationModal from '@components/ConfirmationModal/ConfirmationModal';
import IconArrowHead from '@components/Icons/IconArrowHead/IconArrowHead';
import Modal from '@components/Modal/Modal';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { userThunks } from '@redux/slices/user.slice';
import { User } from '@src/utils/data';
import { splitNameFormFullName } from '@src/utils/string';
import type { TCurrentUser, TUser } from '@src/utils/types';

import { AccountThunks } from '../../Account.slice';
import type { TProfileFormValues } from '../ProfileForm/ProfileForm';
import ProfileForm from '../ProfileForm/ProfileForm';

import css from './ProfileModal.module.scss';

type TProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentUser: TCurrentUser | TUser;
};
const ProfileModal: React.FC<TProfileModalProps> = (props) => {
  const { isOpen, onClose, currentUser } = props;
  const dispatch = useAppDispatch();
  const updateProfileSucessModalControl = useBoolean();
  const updateProfileInProgress = useAppSelector(
    (state) => state.ParticipantAccount.updateProfileInProgress,
  );
  const currentUserGetter = User(currentUser as TUser);
  const { firstName, lastName } = currentUserGetter.getProfile();
  const { email } = currentUserGetter.getAttributes();
  const { phoneNumber } = currentUserGetter.getProtectedData();
  const initialValues = useMemo(
    () => ({ name: `${lastName} ${firstName}`, email, phoneNumber }),
    [email, firstName, lastName, phoneNumber],
  );

  const handleSubmit = async (values: TProfileFormValues) => {
    const { name: fullName, phoneNumber: phoneNumberValue } = values;
    const splitName = splitNameFormFullName(fullName);
    const { meta } = await dispatch(
      AccountThunks.updateProfile({
        firstName: splitName.firstName,
        lastName: splitName.lastName,
        phoneNumber: phoneNumberValue,
      }),
    );

    if (meta.requestStatus !== 'fulfilled') {
      console.error('error');
    } else {
      dispatch(userThunks.fetchCurrentUser());
      updateProfileSucessModalControl.setTrue();
    }
  };

  return (
    <Modal
      id="ProfileModal"
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
        <ProfileForm
          onSubmit={handleSubmit}
          initialValues={initialValues}
          inProgress={updateProfileInProgress}
        />
      </div>
      <ConfirmationModal
        isPopup
        id="ProfileModalConfirmation"
        isOpen={updateProfileSucessModalControl.value}
        onClose={updateProfileSucessModalControl.setFalse}
        title="Thông báo"
        description="Thông tin của bạn đã được cập nhật thành công."
        secondForAutoClose={3}
      />
    </Modal>
  );
};

export default ProfileModal;
