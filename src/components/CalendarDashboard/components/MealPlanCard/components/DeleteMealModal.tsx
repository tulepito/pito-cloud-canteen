import AlertModal from '@components/Modal/AlertModal';
import { useIntl } from 'react-intl';

import css from './DeleteMealModal.module.scss';

type TDeleteMealModalProps = {
  isOpen: boolean;
  onClose?: () => void;
  handleDelete: () => void;
};

const DeleteMealModal: React.FC<TDeleteMealModalProps> = ({
  isOpen,
  onClose = () => null,
  handleDelete,
}) => {
  const intl = useIntl();

  const handleDeletePlan = () => {
    handleDelete();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className={css.root}>
      <AlertModal
        isOpen={isOpen}
        confirmLabel={intl.formatMessage({
          id: 'MealPlanCard.DeleteMealModal.confirm',
        })}
        cancelLabel={intl.formatMessage({
          id: 'MealPlanCard.DeleteMealModal.cancel',
        })}
        handleClose={handleClose}
        onCancel={handleClose}
        onConfirm={handleDeletePlan}
        title={intl.formatMessage({
          id: 'MealPlanCard.DeleteMealModal.title',
        })}>
        <div className={css.modalContent}></div>
      </AlertModal>
    </div>
  );
};

export default DeleteMealModal;
