import Button from '@components/Button/Button';
import Modal from '@components/Modal/Modal';

import css from './ConfirmClientModal.module.scss';

type ConfirmClientModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  onConfirm: () => void;
};
const ConfirmClientModal: React.FC<ConfirmClientModalProps> = (props) => {
  const { isOpen, onClose, onCancel, onConfirm } = props;
  return (
    <Modal
      title="Xac nhan chon cong ty nay"
      isOpen={isOpen}
      handleClose={onClose}>
      <div className={css.modalContainer}>
        <Button onClick={onCancel} className={css.cancel}>
          Huy bo
        </Button>
        <Button onClick={onConfirm}>Xac nhan</Button>
      </div>
    </Modal>
  );
};

export default ConfirmClientModal;
