import Modal from '@components/Modal/Modal';
import { useIntl } from 'react-intl';

import type { TEditOrderDeadlineFormValues } from './EditOrderDeadlineForm';
import EditOrderDeadlineForm from './EditOrderDeadlineForm';
import css from './EditOrderDeadlineModal.module.scss';

type EditOrderDeadlineModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: TEditOrderDeadlineFormValues) => void;
};

const EditOrderDeadlineModal: React.FC<EditOrderDeadlineModalProps> = (
  props,
) => {
  const { isOpen, onClose, onSubmit } = props;
  const intl = useIntl();

  const formInitialValues: TEditOrderDeadlineFormValues = {
    deadlineDate: new Date(2023, 1, 1),
    deadlineHour: '',
  };

  return (
    <Modal
      className={css.root}
      containerClassName={css.modalContainer}
      handleClose={onClose}
      isOpen={isOpen}
      title={intl.formatMessage({
        id: 'EditOrderDeadlineModal.title',
      })}>
      <EditOrderDeadlineForm
        onSubmit={onSubmit}
        startDate={new Date(2023, 2, 1)}
        initialValues={formInitialValues}
      />
    </Modal>
  );
};

export default EditOrderDeadlineModal;
