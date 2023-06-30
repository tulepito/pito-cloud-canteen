/* eslint-disable react-hooks/exhaustive-deps */

import IconArrowHead from '@components/Icons/IconArrowHead/IconArrowHead';
import Modal from '@components/Modal/Modal';
import type { TCurrentUser, TUser } from '@src/utils/types';

import type { TSpecialDemandFormValues } from '../SpecialDemandForm/SpecialDemandForm';
import SpecialDemandForm from '../SpecialDemandForm/SpecialDemandForm';

import css from './SpecialDemandModal.module.scss';

type TSpecialDemandModalProps = {
  isOpen: boolean;
  onClose: () => void;
  nutritionOptions: { key: string; label: string }[];
  currentUser: TUser | TCurrentUser;
  handleSubmit: (values: TSpecialDemandFormValues) => void;
  initialValues: TSpecialDemandFormValues;
  inProgress: boolean;
};
const SpecialDemandModal: React.FC<TSpecialDemandModalProps> = (props) => {
  const {
    isOpen,
    onClose,
    nutritionOptions,
    handleSubmit,
    initialValues,
    inProgress,
  } = props;

  return (
    <Modal
      id="SpecialDemandModal"
      isOpen={isOpen}
      handleClose={onClose}
      className={css.modal}
      closeClassName={css.closedModal}
      containerClassName={css.modalContainer}
      shouldHideIconClose>
      <div className={css.modalHeader}>
        <div className={css.goBackContainer} onClick={onClose}>
          <IconArrowHead direction="left" />
          <span className={css.goBack}></span>
          Quay lại
        </div>
        <div className={css.modalTitle}>Yêu cầu đặc biệt</div>
      </div>
      <div className={css.modalContent}>
        <SpecialDemandForm
          onSubmit={handleSubmit}
          initialValues={initialValues}
          nutritionOptions={nutritionOptions}
          inProgress={inProgress}
        />
      </div>
    </Modal>
  );
};

export default SpecialDemandModal;
