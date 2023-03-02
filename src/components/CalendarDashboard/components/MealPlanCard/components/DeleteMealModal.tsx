import IconSpinner from '@components/Icons/IconSpinner/IconSpinner';
import AlertModal from '@components/Modal/AlertModal';
import { useIntl } from 'react-intl';

import css from './DeleteMealModal.module.scss';

type TDeleteMealModalProps = {
  isOpen: boolean;
  removeInprogress?: boolean;
  deleteDate: string;
  onClose?: () => void;
  onDelete: () => void;
};

const DeleteMealModal: React.FC<TDeleteMealModalProps> = ({
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

  return (
    <div className={css.root}>
      <AlertModal
        isOpen={isOpen}
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
