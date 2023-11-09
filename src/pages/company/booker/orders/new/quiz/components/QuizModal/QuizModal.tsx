import type { PropsWithChildren } from 'react';
import classNames from 'classnames';

import Button from '@components/Button/Button';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconCloseV2 from '@components/Icons/IconCloseV2/IconCloseV2';
import Modal from '@components/Modal/Modal';
import { useAppDispatch } from '@hooks/reduxHooks';
import { QuizActions } from '@redux/slices/Quiz.slice';

import css from './QuizModal.module.scss';

type QuizModalProps = {
  id: string;
  isOpen: boolean;
  stepInfo?: string;
  modalTitle: string | React.ReactNode;
  submitText?: string;
  cancelText?: string;
  submitDisabled?: boolean;
  modalContainerClassName?: string;
  submitInProgress?: boolean;
  modalContentRef?: React.RefObject<HTMLDivElement>;
  handleClose?: () => void;
  onSubmit?: () => void;
  onCancel?: () => void;
  onBack?: () => void;
} & PropsWithChildren;

const QuizModal: React.FC<QuizModalProps> = (props) => {
  const {
    id,
    isOpen,
    stepInfo,
    modalTitle,
    submitText,
    cancelText,
    submitDisabled,
    modalContainerClassName,
    submitInProgress = false,
    onSubmit,
    onCancel,
    onBack,
    children,
    modalContentRef,
  } = props;

  const dispatch = useAppDispatch();

  const modalContainerClasses = classNames(
    css.modalContainer,
    modalContainerClassName,
  );

  const handleCancel = () => {
    dispatch(QuizActions.closeQuizFlow());
  };

  return (
    <Modal
      id={id}
      isOpen={isOpen}
      handleClose={handleCancel}
      containerClassName={modalContainerClasses}
      shouldHideIconClose
      customHeader={<div></div>}>
      <div className={css.container}>
        <div className={css.modalTop}>
          <div className={css.closeBtn} onClick={handleCancel}>
            <IconCloseV2 className={css.closeIcon} />
          </div>
          {stepInfo && (
            <div
              className={classNames(css.stepInfo, {
                [css.stepInfoWithBackBtn]: !!onBack,
              })}>
              {stepInfo}
            </div>
          )}
          {onBack && (
            <div className={css.backBtn} onClick={onBack}>
              <IconArrow direction="left" />
            </div>
          )}
        </div>
        <div className={css.modalHeader}>{modalTitle}</div>
        <div ref={modalContentRef!} className={css.modalContent}>
          {children}
        </div>
        <div className={css.modalFooter}>
          <Button
            className={css.submitBtn}
            onClick={onSubmit}
            disabled={submitDisabled || submitInProgress}
            inProgress={submitInProgress}>
            {submitText}
          </Button>
          {cancelText && (
            <Button
              className={css.cancelBtn}
              onClick={onCancel}
              disabled={submitInProgress}
              variant="inline">
              {cancelText}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default QuizModal;
