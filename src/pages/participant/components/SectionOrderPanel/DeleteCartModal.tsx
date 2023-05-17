import { useIntl } from 'react-intl';

import AlertModal from '@components/Modal/AlertModal';

import css from './DeleteCartModal.module.scss';

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
      containerClassName={css.container}
      shouldFullScreenInMobile={false}
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
      <div className={css.confirmText}>
        {intl.formatMessage({
          id: 'SectionOrderPanel.Alert.confirmDeleteMessage',
        })}
      </div>
    </AlertModal>
  );
};

export default DeleteCartModal;
