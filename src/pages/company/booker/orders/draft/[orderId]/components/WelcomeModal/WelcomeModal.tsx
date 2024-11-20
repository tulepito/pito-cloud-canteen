import { useTour } from '@reactour/tour';

import Button from '@components/Button/Button';
import PopupModal from '@components/PopupModal/PopupModal';
import { useAppDispatch } from '@hooks/reduxHooks';

import { BookerDraftOrderPageActions } from '../../BookerDraftOrderPage.slice';

import css from './WelcomeModal.module.scss';

type WelcomeModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const WelcomeModal: React.FC<WelcomeModalProps> = (props) => {
  const { isOpen, onClose } = props;
  const dispatch = useAppDispatch();
  const { setIsOpen } = useTour();
  const onStartBtnClick = () => {
    onClose();
    setIsOpen(true);
    dispatch(BookerDraftOrderPageActions.setWalkthroughStep(0));
  };

  return (
    <PopupModal
      id="WelcomeModal"
      isOpen={isOpen}
      handleClose={onClose}
      shouldHideIconClose
      containerClassName={css.modalContainer}>
      <div className={css.modalHeader}>
        <div className={css.firstRow}>Thực đơn của bạn đã sẵn sàng!</div>
      </div>
      <div className={css.modalContent}>
        Thực đơn được gợi ý tự động theo yêu cầu của bạn
        <br />
        Bạn có thể xem và tùy chỉnh nhé
      </div>
      <div className={css.modalFooter}>
        <Button onClick={onStartBtnClick} className={css.startBtn}>
          Xem và tùy chỉnh
        </Button>
      </div>
    </PopupModal>
  );
};

export default WelcomeModal;
