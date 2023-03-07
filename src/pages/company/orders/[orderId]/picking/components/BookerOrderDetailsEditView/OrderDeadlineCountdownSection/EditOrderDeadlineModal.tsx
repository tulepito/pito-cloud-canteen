import { useIntl } from 'react-intl';
import { DateTime } from 'luxon';

import Modal from '@components/Modal/Modal';

import type { TEditOrderDeadlineFormValues } from './EditOrderDeadlineForm';
import EditOrderDeadlineForm from './EditOrderDeadlineForm';

import css from './EditOrderDeadlineModal.module.scss';

type TEditOrderDeadlineModalProps = {
  isOpen: boolean;
  data: {
    orderStartDate: number;
    orderDeadline: number;
    orderDeadlineHour: string;
  };
  onClose: () => void;
  onSubmit: (values: TEditOrderDeadlineFormValues) => void;
};

const EditOrderDeadlineModal: React.FC<TEditOrderDeadlineModalProps> = (
  props,
) => {
  const {
    isOpen,
    onClose,
    onSubmit,
    data: { orderStartDate, orderDeadline, orderDeadlineHour },
  } = props;
  const intl = useIntl();

  const formInitialValues: TEditOrderDeadlineFormValues = {
    deadlineDate:
      orderDeadline ||
      DateTime.fromJSDate(new Date()).plus({ day: 7 }).toMillis(),
    deadlineHour: orderDeadlineHour || '',
  };

  return (
    <Modal
      className={css.root}
      containerClassName={css.modalContainer}
      handleClose={onClose}
      isOpen={isOpen}
      title={
        <span className={css.title}>
          {intl.formatMessage({
            id: 'EditOrderDeadlineModal.title',
          })}
        </span>
      }>
      <EditOrderDeadlineForm
        onSubmit={onSubmit}
        startDate={orderStartDate}
        initialValues={formInitialValues}
      />
    </Modal>
  );
};

export default EditOrderDeadlineModal;
