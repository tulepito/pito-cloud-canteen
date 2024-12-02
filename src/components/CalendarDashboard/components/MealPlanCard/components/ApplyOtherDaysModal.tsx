import { useMemo } from 'react';
import { useIntl } from 'react-intl';

import Modal from '@components/Modal/Modal';
import SlideModal from '@components/SlideModal/SlideModal';
import { useViewport } from '@hooks/useViewport';
import type { TAvailabilityPlanEntries } from '@src/utils/types';

import ApplyOtherDaysForm from '../forms/ApplyOtherDaysForm';

import css from './ApplyOtherDaysModal.module.scss';

type TApplyOtherDaysModalProps = {
  isOpen: boolean;
  currentDayInWeek: string;
  dayInWeek?: string[];
  inProgress?: boolean;
  startDate?: Date | number;
  endDate?: Date | number;
  onSubmit?: (params: any) => void;
  onClose?: () => void;
  availabilityPlanDayOfWeek?: TAvailabilityPlanEntries[];
};

const ApplyOtherDaysModal: React.FC<TApplyOtherDaysModalProps> = ({
  isOpen,
  onSubmit = () => null,
  onClose = () => null,
  currentDayInWeek,
  dayInWeek,
  inProgress,
  startDate,
  endDate,
  availabilityPlanDayOfWeek,
}) => {
  const intl = useIntl();

  const { isTabletLayoutOrLarger } = useViewport();

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

  const ModalComponent = !isTabletLayoutOrLarger ? SlideModal : Modal;

  return (
    <div className={css.root}>
      <ModalComponent
        id="ApplyOtherDaysModal"
        isOpen={isOpen}
        handleClose={handleClose}
        onClose={handleClose}
        containerClassName={css.modalContainer}
        scrollLayerClassName={css.modalScrollLayer}
        openClassName={css.openModal}
        modalTitle={intl.formatMessage({
          id: 'ApplyOtherDaysModal.title',
        })}
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
            startDate={startDate}
            endDate={endDate}
            availabilityPlanDayOfWeek={availabilityPlanDayOfWeek}
          />
        </div>
      </ModalComponent>
    </div>
  );
};

export default ApplyOtherDaysModal;
