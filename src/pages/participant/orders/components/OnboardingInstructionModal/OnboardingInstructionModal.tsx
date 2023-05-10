import PopupModal from '@components/PopupModal/PopupModal';

import css from './OnboardingInstructionModal.module.scss';

type TOnboardingInstructionModalProps = {
  id: string;
  isOpen: boolean;
  step: string;
  onClose: () => void;
};
const OnboardingInstructionModal: React.FC<TOnboardingInstructionModalProps> = (
  props,
) => {
  const { isOpen, onClose, id, step } = props;

  return (
    <PopupModal
      id={id}
      isOpen={isOpen}
      handleClose={onClose}
      shouldHideIconClose>
      <div className={css.step}>{step}</div>
    </PopupModal>
  );
};

export default OnboardingInstructionModal;
