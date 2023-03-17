import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import IconTickWithCircle from '@components/Icons/IconTickWithCircle/IconTickWithCircle';
import Modal from '@components/Modal/Modal';

import css from './SectionOrderPanel.module.scss';

type TSuccessModal = {
  isOpen: boolean;
  handleClose: () => void;
};

const SuccessModal: React.FC<TSuccessModal> = ({ isOpen, handleClose }) => {
  const intl = useIntl();
  const router = useRouter();

  const goToHomePage = () => {
    router.push('/');
  };

  return (
    <Modal
      id="ParticipantOrderSuccessModal"
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
          <IconTickWithCircle />
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
        <Button
          className={css.successModalConfirmBtn}
          variant="inline"
          onClick={goToHomePage}>
          {intl.formatMessage({
            id: 'SectionOrderPanel.successModal.goToHomePage',
          })}
        </Button>
      </div>
    </Modal>
  );
};

export default SuccessModal;
