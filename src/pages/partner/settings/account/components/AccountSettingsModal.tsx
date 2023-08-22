import IconArrow from '@components/Icons/IconArrow/IconArrow';
import Modal from '@components/Modal/Modal';

import AccountSettingsForm from './AccountSettingsForm';

import css from './AccountSettingsModal.module.scss';

type TNavigationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const AccountSettingsModal: React.FC<TNavigationModalProps> = (props) => {
  const { isOpen, onClose } = props;

  return (
    <Modal
      isOpen={isOpen}
      className={css.root}
      handleClose={() => {}}
      containerClassName={css.modalContainer}
      headerClassName={css.modalHeader}
      shouldHideIconClose>
      <div>
        <div className={css.heading} onClick={onClose}>
          <IconArrow direction="left" />
          <div>Thông tin tài khoản</div>
        </div>

        <AccountSettingsForm onSubmit={() => {}} />
      </div>
    </Modal>
  );
};

export default AccountSettingsModal;
