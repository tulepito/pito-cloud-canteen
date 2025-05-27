import { useIntl } from 'react-intl';

import IconArrowHead from '@components/Icons/IconArrowHead/IconArrowHead';
import Modal from '@components/Modal/Modal';
import { useAppSelector } from '@hooks/reduxHooks';
import type { TCurrentUser } from '@src/utils/types';

import type { TProfileFormValues } from '../ProfileForm/ProfileForm';
import ProfileForm from '../ProfileForm/ProfileForm';

import css from './ProfileModal.module.scss';

type TProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentUser: TCurrentUser;
  handleSubmit: (values: TProfileFormValues) => void;
  initialValues?: TProfileFormValues;
};
const ProfileModal: React.FC<TProfileModalProps> = (props) => {
  const { isOpen, onClose, handleSubmit, initialValues, currentUser } = props;
  const intl = useIntl();
  const updateProfileInProgress = useAppSelector(
    (state) => state.user.updateProfileInProgress,
  );

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
          {intl.formatMessage({
            id: 'booker.orders.draft.foodDetailModal.back',
          })}
        </div>
        <div className={css.modalTitle}>
          {intl.formatMessage({
            id: 'ParticipantAccountSettingRoute.description',
          })}
        </div>
      </div>
      <div className={css.modalContent}>
        <ProfileForm
          onSubmit={handleSubmit}
          initialValues={initialValues!}
          inProgress={updateProfileInProgress}
          currentUser={currentUser}
        />
      </div>
    </Modal>
  );
};

export default ProfileModal;
