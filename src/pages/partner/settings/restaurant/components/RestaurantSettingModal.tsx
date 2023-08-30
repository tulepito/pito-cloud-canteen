import Alert, { EAlertPosition, EAlertType } from '@components/Alert/Alert';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import Modal from '@components/Modal/Modal';
import useBoolean from '@hooks/useBoolean';

import RestaurantSettingForm from './RestaurantSettingForm';

import css from './RestaurantSettingModal.module.scss';

type TRestaurantSettingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialValues: any;
};

const RestaurantSettingModal: React.FC<TRestaurantSettingModalProps> = (
  props,
) => {
  const { isOpen, onClose, initialValues } = props;
  const changePasswordSuccessModalControl = useBoolean();

  const handleCloseSuccessModal = () => {
    changePasswordSuccessModalControl.setFalse();
  };

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
          <div>Cài đặt nhà hàng</div>
        </div>

        <RestaurantSettingForm
          onSubmit={() => {}}
          initialValues={initialValues}
        />

        <Alert
          message="Cập nhật thông tin thành công"
          isOpen={changePasswordSuccessModalControl.value}
          autoClose
          onClose={handleCloseSuccessModal}
          type={EAlertType.success}
          hasCloseButton={false}
          position={EAlertPosition.bottomLeft}
          messageClassName={css.alertMessage}
        />
      </div>
    </Modal>
  );
};

export default RestaurantSettingModal;
