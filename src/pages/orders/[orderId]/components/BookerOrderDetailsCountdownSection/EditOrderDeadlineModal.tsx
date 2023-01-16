import Modal from '@components/Modal/Modal';
import { useIntl } from 'react-intl';

import type { TEditOrderDeadlineFormValues } from './EditOrderDeadlineForm';
import EditOrderDeadlineForm from './EditOrderDeadlineForm';
import css from './EditOrderDeadlineModal.module.scss';

type EditOrderDeadlineModalProps = {
  isOpen: boolean;
  data: {
    orderStartDate: number;
    orderDeadline: number;
  };
  onClose: () => void;
  onSubmit: (values: TEditOrderDeadlineFormValues) => void;
};

const EditOrderDeadlineModal: React.FC<EditOrderDeadlineModalProps> = (
  props,
) => {
  const {
    isOpen,
    onClose,
    onSubmit,
    data: { orderStartDate, orderDeadline },
  } = props;
  const intl = useIntl();

  const formInitialValues: TEditOrderDeadlineFormValues = {
    deadlineDate: new Date(orderDeadline) || new Date(2023, 1, 1),
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
        startDate={orderStartDate}
        initialValues={formInitialValues}
      />
    </Modal>
  );
};

export default EditOrderDeadlineModal;
