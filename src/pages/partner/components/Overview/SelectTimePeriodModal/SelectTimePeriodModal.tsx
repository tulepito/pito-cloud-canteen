import IconArrow from '@components/Icons/IconArrow/IconArrow';
import SlideModal from '@components/SlideModal/SlideModal';
import useBoolean from '@hooks/useBoolean';

import SelectTimePeriodForm from '../SelectTimePeriodForm/SelectTimePeriodForm';

import css from './SelectTimePeriodModal.module.scss';

type TSelectTimePeriodModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SelectTimePeriodModal: React.FC<TSelectTimePeriodModalProps> = (
  props,
) => {
  const { isOpen, onClose } = props;
  const selectCustomController = useBoolean();

  const modalTitle = selectCustomController.value ? (
    <div className={css.modalTitle} onClick={selectCustomController.setFalse}>
      <IconArrow direction="left" />
      <span>Quay lại</span>
    </div>
  ) : (
    'Phạm vi ngày'
  );

  const onSubmit = () => {};

  return (
    <SlideModal
      id="SelectTimePeriodModal"
      isOpen={isOpen}
      onClose={onClose}
      modalTitle={modalTitle}
      containerClassName={css.modalContainer}>
      <SelectTimePeriodForm
        onSubmit={onSubmit}
        shouldShowCustomSelect={selectCustomController.value}
        onCustomSelectClick={selectCustomController.setTrue}
        onBackToTimePeriodSelectClick={selectCustomController.setFalse}
        onCloseModal={onClose}
      />
    </SlideModal>
  );
};

export default SelectTimePeriodModal;
