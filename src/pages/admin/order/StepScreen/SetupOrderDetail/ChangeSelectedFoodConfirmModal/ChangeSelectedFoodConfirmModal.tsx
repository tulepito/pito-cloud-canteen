import Button from '@components/Button/Button';
import { IconCheckbox } from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import IconDangerWithCircle from '@components/Icons/IconDangerWithCircle/IconDangerWithCircle';
import PopupModal from '@components/PopupModal/PopupModal';
import { setItem } from '@helpers/localStorageHelpers';

import css from './ChangeSelectedFoodConfirmModal.module.scss';

type TChangeSelectedFoodConfirmModalProps = {
  isOpen: boolean;
  handleClose: () => void;
  onCancelChangeFood: () => void;
  onConfirmChangeFood: () => void;
};

const ChangeSelectedFoodConfirmModal: React.FC<
  TChangeSelectedFoodConfirmModalProps
> = (props) => {
  const { isOpen, handleClose, onCancelChangeFood, onConfirmChangeFood } =
    props;
  const onChange = (e: any) => {
    setItem('isHideChangeSelectedFoodConfirmModal', e.target.checked);
  };

  const handleCancel = () => {
    onCancelChangeFood();
    handleClose();
  };

  return (
    <PopupModal
      id="ChangeSelectedFoodConfirmModal"
      isOpen={isOpen}
      handleClose={handleClose}
      containerClassName={css.modalContainer}
      shouldHideIconClose>
      <div className={css.modalContent}>
        <IconDangerWithCircle />
        <div className={css.content}>
          Các lựa chọn của nhà hàng cũ sẽ hoàn toàn bị thay đối (bao gồm món đã
          chọn, số lượng món đã chọn...)
        </div>
        <form>
          <div className={css.checkboxInput}>
            <input
              id="hideModalNextTime"
              type="checkbox"
              className={css.input}
              onChange={onChange}
              hidden
            />
            <label className={css.label} htmlFor="hideModalNextTime">
              <span className={css.checkboxWrapper}>
                <IconCheckbox
                  checkedClassName={css.checked}
                  boxClassName={css.box}
                />
              </span>
            </label>
          </div>
          <div className={css.checkboxLabel}>
            Không hiển thị thông báo cho những lần sau
          </div>
        </form>
        <div className={css.bottomBtns}>
          <Button
            className={css.btn}
            variant="secondary"
            onClick={handleCancel}>
            Huỷ thay đổi
          </Button>
          <Button
            className={css.btn}
            variant="primary"
            onClick={onConfirmChangeFood}>
            Tiếp tục
          </Button>
        </div>
      </div>
    </PopupModal>
  );
};

export default ChangeSelectedFoodConfirmModal;
