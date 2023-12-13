import { useIntl } from 'react-intl';

import IconSpinner from '@components/Icons/IconSpinner/IconSpinner';
import AlertModal from '@components/Modal/AlertModal';

import css from './DeleteMealModal.module.scss';

type TDeleteMealModalProps = {
  isOpen: boolean;
  removeInprogress?: boolean;
  deleteDate: string;
  id: string;
  onClose?: () => void;
  onDelete: () => void;
};

const DeleteMealModal: React.FC<TDeleteMealModalProps> = ({
  id,
  isOpen,
  removeInprogress,
  onClose = () => null,
  onDelete,
  deleteDate,
}) => {
  const intl = useIntl();

  const handleDeletePlan = () => {
    if (removeInprogress) {
      return;
    }

    onDelete();
  };

  const handleClose = () => {
    onClose();
  };
  if (!isOpen) return null;

  return (
    <div className={css.root}>
      <AlertModal
        id={id}
        isOpen={isOpen}
        containerClassName={css.container}
        confirmLabel={
          <div className={css.confirmBtnWrapper}>
            <span>
              {intl.formatMessage({
                id: 'MealPlanCard.DeleteMealModal.confirm',
              })}
            </span>
            {removeInprogress && <IconSpinner />}
          </div>
        }
        cancelLabel={intl.formatMessage({
          id: 'MealPlanCard.DeleteMealModal.cancel',
        })}
        handleClose={handleClose}
        shouldFullScreenInMobile={false}
        onCancel={handleClose}
        onConfirm={handleDeletePlan}
        title={intl.formatMessage({
          id: 'MealPlanCard.DeleteMealModal.title',
        })}>
        <div className={css.modalContent}>
          {intl.formatMessage(
            { id: 'DeleteMealModal.content' },
            { deleteDate },
          )}
        </div>
      </AlertModal>
    </div>
  );
};

export default DeleteMealModal;
