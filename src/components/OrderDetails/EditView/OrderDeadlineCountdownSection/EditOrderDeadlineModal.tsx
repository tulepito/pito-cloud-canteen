import { useIntl } from 'react-intl';
import { DateTime } from 'luxon';

import Modal from '@components/Modal/Modal';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import SlideModal from '@components/SlideModal/SlideModal';
import { useViewport } from '@hooks/useViewport';

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
  const { isMobileLayout } = useViewport();

  const formInitialValues: TEditOrderDeadlineFormValues = {
    deadlineDate:
      orderDeadline ||
      DateTime.fromJSDate(new Date()).plus({ day: 7 }).toMillis(),
    deadlineHour: orderDeadlineHour || '',
  };

  const formComponent = (
    <EditOrderDeadlineForm
      onSubmit={onSubmit}
      startDate={orderStartDate}
      initialValues={formInitialValues}
    />
  );

  return (
    <RenderWhen condition={isMobileLayout}>
      <SlideModal
        id="EditOrderDeadlineModal.modal"
        containerClassName={css.mobileModalContainer}
        onClose={onClose}
        isOpen={isOpen}
        modalTitle={intl.formatMessage({
          id: 'EditOrderDeadlineModal.title',
        })}>
        {formComponent}
      </SlideModal>

      <RenderWhen.False>
        <Modal
          className={css.modalRoot}
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
          {formComponent}
        </Modal>
      </RenderWhen.False>
    </RenderWhen>
  );
};

export default EditOrderDeadlineModal;
