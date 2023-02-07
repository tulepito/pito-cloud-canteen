import Modal from '@components/Modal/Modal';
import { useIntl } from 'react-intl';

import ApplyOtherDaysForm from '../forms/ApplyOtherDaysForm';
import css from './ApplyOtherDaysModal.module.scss';

type TApplyOtherDaysModalProps = {
  isOpen: boolean;
  onSubmit?: (params: any) => void;
  onClose?: () => void;
};

const ApplyOtherDaysModal: React.FC<TApplyOtherDaysModalProps> = ({
  isOpen,
  onSubmit = () => null,
  onClose = () => null,
}) => {
  const intl = useIntl();

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = (values: any) => {
    onSubmit(values);
  };

  return (
    <div className={css.root}>
      <Modal
        isOpen={isOpen}
        handleClose={handleClose}
        containerClassName={css.modalContainer}
        scrollLayerClassName={css.modalScrollLayer}
        openClassName={css.openModal}
        title={intl.formatMessage({
          id: 'ApplyOtherDaysModal.title',
        })}>
        <div className={css.modalContent}>
          <ApplyOtherDaysForm onSubmit={handleSubmit} onCancel={handleClose} />
        </div>
      </Modal>
    </div>
  );
};

export default ApplyOtherDaysModal;
