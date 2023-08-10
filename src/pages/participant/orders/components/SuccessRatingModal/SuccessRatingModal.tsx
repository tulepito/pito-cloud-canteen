import Button from '@components/Button/Button';
import IconTickWithCircle from '@components/Icons/IconTickWithCircle/IconTickWithCircle';
import PopupModal from '@components/PopupModal/PopupModal';
import RenderWhen from '@components/RenderWhen/RenderWhen';

import css from './SuccessRatingModal.module.scss';

type TSuccessRatingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  closeAllModals?: () => void;
  fromOrderList?: boolean;
};

const SuccessRatingModal: React.FC<TSuccessRatingModalProps> = (props) => {
  const { isOpen, onClose, closeAllModals, fromOrderList = false } = props;
  const goToMyCalendar = () => {
    closeAllModals?.();
  };

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
      <RenderWhen condition={fromOrderList}>
        <Button className={css.btn} onClick={goToMyCalendar}>
          Về Lịch của tôi
        </Button>
        <RenderWhen.False>
          <Button className={css.btn} onClick={onClose}>
            Đóng
          </Button>
        </RenderWhen.False>
      </RenderWhen>
    </PopupModal>
  );
};

export default SuccessRatingModal;
