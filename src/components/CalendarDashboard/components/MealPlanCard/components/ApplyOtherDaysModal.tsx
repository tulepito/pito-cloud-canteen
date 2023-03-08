import { useMemo } from 'react';
import { useIntl } from 'react-intl';

import Modal from '@components/Modal/Modal';

import ApplyOtherDaysForm from '../forms/ApplyOtherDaysForm';

import css from './ApplyOtherDaysModal.module.scss';

type TApplyOtherDaysModalProps = {
  isOpen: boolean;
  currentDayInWeek: string;
  dayInWeek?: string[];
  inProgress?: boolean;
  onSubmit?: (params: any) => void;
  onClose?: () => void;
};

const ApplyOtherDaysModal: React.FC<TApplyOtherDaysModalProps> = ({
  isOpen,
  onSubmit = () => null,
  onClose = () => null,
  currentDayInWeek,
  dayInWeek,
  inProgress,
}) => {
  const intl = useIntl();

  const initialValues = useMemo(
    () => ({
      selectedDays: [currentDayInWeek],
    }),
    [currentDayInWeek],
  );

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = (values: any) => {
    onSubmit(values.selectedDays);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={css.root}>
      <Modal
        id="ApplyOtherDaysModal"
        isOpen={isOpen}
        handleClose={handleClose}
        containerClassName={css.modalContainer}
        scrollLayerClassName={css.modalScrollLayer}
        openClassName={css.openModal}
        title={intl.formatMessage({
          id: 'ApplyOtherDaysModal.title',
        })}>
        <div className={css.modalContent}>
          <ApplyOtherDaysForm
            onSubmit={handleSubmit}
            onCancel={handleClose}
            initialValues={initialValues}
            dayInWeek={dayInWeek}
            inProgress={inProgress}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ApplyOtherDaysModal;
