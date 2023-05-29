import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import IconTickWithCircle from '@components/Icons/IconTickWithCircle/IconTickWithCircle';
import PopupModal from '@components/PopupModal/PopupModal';
import { participantPaths } from '@src/paths';

import css from './SuccessRatingModal.module.scss';

type TSuccessRatingModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SuccessRatingModal: React.FC<TSuccessRatingModalProps> = (props) => {
  const { isOpen, onClose } = props;
  const router = useRouter();
  const goToMyCalendar = () => {
    router.push(participantPaths.OrderList);
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
      <Button className={css.btn} onClick={goToMyCalendar}>
        Về Lịch của tôi
      </Button>
    </PopupModal>
  );
};

export default SuccessRatingModal;
