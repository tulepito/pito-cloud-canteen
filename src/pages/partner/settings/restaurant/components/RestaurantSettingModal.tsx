import Alert, { EAlertPosition, EAlertType } from '@components/Alert/Alert';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import Modal from '@components/Modal/Modal';
import { useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';

import type { TRestaurantSettingFormValues } from './RestaurantSettingForm';
import RestaurantSettingForm from './RestaurantSettingForm';

import css from './RestaurantSettingModal.module.scss';

type TNavigationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const RestaurantSettingModal: React.FC<TNavigationModalProps> = (props) => {
  const { isOpen, onClose } = props;
  const changePasswordSuccessModalControl = useBoolean();
  // const dispatch = useAppDispatch();
  const changePasswordInProgress = useAppSelector(
    (state) => state.password.changePasswordInProgress,
  );

  const handleSubmit = async (_values: TRestaurantSettingFormValues) => {};

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
          onSubmit={handleSubmit}
          inProgress={changePasswordInProgress}
        />

        <Alert
          message="Cập nhật mật khẩu thành công"
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
