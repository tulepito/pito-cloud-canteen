import { useIntl } from 'react-intl';

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
  const intl = useIntl();

  return (
    <Modal
      title={intl.formatMessage({ id: 'ConfirmClientModal.title' })}
      isOpen={isOpen}
      handleClose={onClose}>
      <div className={css.modalContainer}>
        <Button variant="secondary" onClick={onCancel}>
          {intl.formatMessage({ id: 'ConfirmClientModal.cancel' })}
        </Button>
        <Button onClick={onConfirm}>
          {intl.formatMessage({ id: 'ConfirmClientModal.confirm' })}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmClientModal;
