import { useIntl } from 'react-intl';

import AlertModal from '@components/Modal/AlertModal';

type TDeleteCartModal = {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  onConfirm: () => void;
};

const DeleteCartModal: React.FC<TDeleteCartModal> = ({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
}) => {
  const intl = useIntl();

  return (
    <AlertModal
      isOpen={isOpen}
      handleClose={onClose}
      title={intl.formatMessage({
        id: 'SectionOrderPanel.Alert.confirmDeleteTitle',
      })}
      cancelLabel={intl.formatMessage({
        id: 'SectionOrderPanel.Alert.cancelDeleteBtn',
      })}
      confirmLabel={intl.formatMessage({
        id: 'SectionOrderPanel.Alert.confirmDeleteBtn',
      })}
      onCancel={onCancel}
      onConfirm={onConfirm}>
      {intl.formatMessage({
        id: 'SectionOrderPanel.Alert.confirmDeleteMessage',
      })}
    </AlertModal>
  );
};

export default DeleteCartModal;
