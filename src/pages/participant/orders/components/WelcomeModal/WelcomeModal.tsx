import Button from '@components/Button/Button';
import PopupModal from '@components/PopupModal/PopupModal';

import css from './WelcomeModal.module.scss';

type WelcomeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  openUpdateProfileModal: () => void;
};

const WelcomeModal: React.FC<WelcomeModalProps> = (props) => {
  const { isOpen, onClose, openUpdateProfileModal } = props;

  const onStartBtnClick = () => {
    onClose();
    openUpdateProfileModal();
  };

  return (
    <PopupModal
      id="WelcomeModal"
      isOpen={isOpen}
      handleClose={onClose}
      shouldHideIconClose
      containerClassName={css.modalContainer}>
      <div className={css.modalHeader}>
        <div className={css.firstRow}>Chào Mừng bạn đến với</div>
        <div className={css.secondRow}>PITO Cloud Canteen</div>
      </div>
      <div className={css.modalContent}>
        Công ty đã chuẩn bị cho bạn rất nhiều món ăn ngon. Cùng khám phá nào!
      </div>
      <div className={css.modalFooter}>
        <Button onClick={onStartBtnClick} className={css.startBtn}>
          Bắt đầu
        </Button>
      </div>
    </PopupModal>
  );
};

export default WelcomeModal;
