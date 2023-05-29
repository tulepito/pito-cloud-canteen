import Button from '@components/Button/Button';
import IconTickWithCircle from '@components/Icons/IconTickWithCircle/IconTickWithCircle';
import PopupModal from '@components/PopupModal/PopupModal';

import css from './SuccessRatingModal.module.scss';

type TSuccessRatingModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SuccessRatingModal: React.FC<TSuccessRatingModalProps> = (props) => {
  const { isOpen, onClose } = props;

  return (
    <PopupModal
      id="SuccessRatingModal"
      shouldHideIconClose
      isOpen={isOpen}
      containerClassName={css.modalContainer}
      customHeader={<span></span>}
      handleClose={onClose}>
      <div className={css.modalHeader}>Đánh giá thành công</div>
      <div className={css.modalContent}>
        <IconTickWithCircle className={css.successIcon} />
        <p>Cảm ơn đánh giá của bạn</p>
      </div>
      <Button className={css.btn} onClick={onClose}>
        Về Lịch của tôi
      </Button>
    </PopupModal>
  );
};

export default SuccessRatingModal;
