import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import PopupModal from '@components/PopupModal/PopupModal';
import { enGeneralPaths } from '@src/paths';

import css from './HomeReturnModal.module.scss';

type THomeReturnModalProps = {
  isOpen: boolean;
  onClose: (e: React.MouseEvent<HTMLElement>) => void;
};

const HomeReturnModal: React.FC<THomeReturnModalProps> = (props) => {
  const { isOpen, onClose } = props;
  const router = useRouter();

  const handleGoHome = () => {
    router.push({ pathname: enGeneralPaths.Auth });
  };

  return (
    <PopupModal
      id="HomeReturnModal"
      title="Về trang chủ"
      isOpen={isOpen}
      containerClassName={css.modalContainer}
      handleClose={onClose}>
      <div className={css.modalContent}>
        Đơn hàng sẽ được lưu lại, bạn vẫn có thể tiếp tục đặt đơn vào lúc khác.
      </div>
      <div className={css.btns}>
        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>
        <Button onClick={handleGoHome}>Về trang chủ</Button>
      </div>
    </PopupModal>
  );
};

export default HomeReturnModal;
