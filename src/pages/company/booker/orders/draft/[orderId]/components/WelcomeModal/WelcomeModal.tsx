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
        <div className={css.firstRow}>Chào Mừng bạn đến với</div>
        <div className={css.secondRow}>PITO Cloud Canteen</div>
      </div>
      <div className={css.modalContent}>
        Khám phá các nhà hàng và lựa chọn món ăn theo sở thích nhé. <br />
        Chúc bạn có những trải nghiệm ẩm thực trọn vẹn!
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
