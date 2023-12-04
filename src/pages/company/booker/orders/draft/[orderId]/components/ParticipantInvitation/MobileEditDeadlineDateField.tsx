import { useEffect } from 'react';

import Button from '@components/Button/Button';
import FieldDatePicker from '@components/FormFields/FieldDatePicker/FieldDatePicker';
import IconCalendar from '@components/Icons/IconCalender/IconCalender';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import SlideModal from '@components/SlideModal/SlideModal';
import useBoolean from '@hooks/useBoolean';
import { formatTimestamp } from '@src/utils/dates';

import css from './MobileEditDeadlineDateField.module.scss';

type TMobileEditDeadlineDateFieldProps = {
  minDate: Date;
  maxDate: Date;
  initialDeadlineDate: Date | null;
  selectedDate: Date | null;
  setSelectedDate: (value: Date | null) => void;
};

const MobileEditDeadlineDateField: React.FC<
  TMobileEditDeadlineDateFieldProps
> = ({
  minDate,
  maxDate,
  initialDeadlineDate,
  selectedDate,
  setSelectedDate,
}) => {
  const control = useBoolean();

  const formattedDeadlineDate =
    selectedDate !== null
      ? formatTimestamp(selectedDate?.getTime(), 'EEE, dd MMMM, yyyy')
      : 'Chọn hạn chọn món';

  const handleSubmitDate = () => {
    setSelectedDate(selectedDate);
    control.setFalse();
  };

  useEffect(() => {
    setSelectedDate(initialDeadlineDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialDeadlineDate)]);

  return (
    <>
      <div className={css.mobileInfoContainer} onClick={control.setTrue}>
        <div className={css.label}>{'Ngày kết thúc'}</div>
        <div className={css.mobileDeadlineDateInfo}>
          <IconCalendar />
          <div className={initialDeadlineDate !== null ? '' : css.placeholder}>
            {formattedDeadlineDate}
          </div>
        </div>
      </div>

      <RenderWhen condition={control.value}>
        <SlideModal
          id="MobileEditDeadlineDateField.slideModal"
          modalTitle="Chọn ngày"
          isOpen={control.value}
          onClose={control.setFalse}
          containerClassName={css.mobileModalContainer}>
          <div className={css.container}>
            <FieldDatePicker
              inputRootClassName={css.inputRoot}
              id="MobileEditDeadlineDateField"
              name="deadlineDate"
              minDate={minDate}
              maxDate={maxDate}
              selected={selectedDate}
              onChange={setSelectedDate}
              customInput={null}
              open
            />

            <div className={css.actions}>
              <Button variant={'secondary'} onClick={control.setFalse}>
                Hủy
              </Button>
              <Button type="button" onClick={handleSubmitDate}>
                Áp dụng
              </Button>
            </div>
          </div>
        </SlideModal>
      </RenderWhen>
    </>
  );
};

export default MobileEditDeadlineDateField;
