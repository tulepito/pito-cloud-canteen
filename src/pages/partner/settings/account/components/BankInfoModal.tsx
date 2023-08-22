import IconArrow from '@components/Icons/IconArrow/IconArrow';
import Modal from '@components/Modal/Modal';

import BankInfoForm from './BankInfoForm';

import css from './BankInfoModal.module.scss';

type TNavigationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const BankInfoModal: React.FC<TNavigationModalProps> = (props) => {
  const { isOpen, onClose } = props;

  return (
    <Modal
      isOpen={isOpen}
      className={css.root}
      handleClose={() => {}}
      containerClassName={css.modalContainer}
      headerClassName={css.modalHeader}
      shouldHideIconClose>
      <div>
        <div className={css.heading}>
          <IconArrow direction="left" onClick={onClose} />
          <div>Thông tin ngân hàng</div>
        </div>

        <BankInfoForm onSubmit={() => {}} />
      </div>
    </Modal>
  );
};

export default BankInfoModal;
