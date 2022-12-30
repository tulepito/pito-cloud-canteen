import Badge from '@components/Badge/Badge';
import Modal from '@components/Modal/Modal';

import SelectFoodForm from '../SelectFoodForm/SelectFoodForm';
import css from './SelectFoodModal.module.scss';

type TSelectFoodModalProps = {
  isOpen: boolean;
  handleClose: () => void;
  items: any[];
};

const SelectFoodModal: React.FC<TSelectFoodModalProps> = (props) => {
  const { isOpen, handleClose, items } = props;
  const titlePart = (
    <div className={css.modalTitleContainer}>
      <div className={css.title}>Nhà hàng Vua hải sản</div>
      <Badge type="warning" label="Đã chọn: 0 món" hasDotIcon />
    </div>
  );

  return (
    <Modal title={titlePart} isOpen={isOpen} handleClose={handleClose}>
      <SelectFoodForm onSubmit={() => {}} items={items} />
    </Modal>
  );
};

export default SelectFoodModal;
