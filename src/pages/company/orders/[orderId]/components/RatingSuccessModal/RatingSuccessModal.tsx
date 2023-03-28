import Button from '@components/Button/Button';
import IconTickWithCircle from '@components/Icons/IconTickWithCircle/IconTickWithCircle';
import Modal from '@components/Modal/Modal';

import css from './RatingSuccessModal.module.scss';

type RatingSuccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
  goToHome?: () => void;
};
const RatingSuccessModal: React.FC<RatingSuccessModalProps> = ({
  isOpen,
  onClose,
  goToHome,
}) => {
  return (
    <Modal
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
    </Modal>
  );
};

export default RatingSuccessModal;
