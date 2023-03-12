import { useIntl } from 'react-intl';

import Button from '@components/Button/Button';
import Modal from '@components/Modal/Modal';

import SuccessImage from './SuccessImage';

import css from './SectionOrderPanel.module.scss';

type TSuccessModal = {
  isOpen: boolean;
  handleClose: () => void;
};

const SuccessModal: React.FC<TSuccessModal> = ({ isOpen, handleClose }) => {
  const intl = useIntl();

  return (
    <Modal
      isOpen={isOpen}
      handleClose={handleClose}
      containerClassName={css.successModalContainer}
      customHeader={
        <div className={css.successModalTitle}>
          {intl.formatMessage({
            id: 'SectionOrderPanel.successModal.title',
          })}
        </div>
      }>
      <div>
        <div className={css.successModalImage}>
          <SuccessImage />
        </div>
        <p className={css.successModalDescription}>
          {intl.formatMessage({
            id: 'SectionOrderPanel.successModal.description',
          })}
        </p>
        <Button className={css.successModalConfirmBtn} onClick={handleClose}>
          {intl.formatMessage({
            id: 'SectionOrderPanel.successModal.confirmBtn',
          })}
        </Button>
      </div>
    </Modal>
  );
};

export default SuccessModal;
