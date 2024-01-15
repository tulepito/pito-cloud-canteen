import Button from '@components/Button/Button';
import IconTickWithCircle from '@components/Icons/IconTickWithCircle/IconTickWithCircle';
import Modal from '@components/Modal/Modal';
import PopupModal from '@components/PopupModal/PopupModal';

import css from './RatingSuccessModal.module.scss';

type RatingSuccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
  goToHome?: () => void;
  isPopup?: boolean;
};
const RatingSuccessModal: React.FC<RatingSuccessModalProps> = ({
  isOpen,
  onClose,
  goToHome,
  isPopup,
}) => {
  const ModalComponent = isPopup ? PopupModal : Modal;

  return (
    <ModalComponent
      id="RatingSuccessModal"
      isOpen={isOpen}
      handleClose={onClose}
      shouldHideIconClose>
      <div className={css.container}>
        <div className={css.title}>Đánh giá thành công</div>
        <IconTickWithCircle className={css.tickIcon} />
        <Button className={css.btn} onClick={goToHome}>
          Về trang chủ
        </Button>
      </div>
    </ModalComponent>
  );
};

export default RatingSuccessModal;
