import classNames from 'classnames';

import Button from '@components/Button/Button';
import FieldRadioButton from '@components/FormFields/FieldRadioButton/FieldRadioButton';
import IconCalendar from '@components/Icons/IconCalender/IconCalender';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import SlideModal from '@components/SlideModal/SlideModal';
import useBoolean from '@hooks/useBoolean';
import { TimeOptions } from '@src/utils/dates';
import { getLabelByKey } from '@src/utils/options';

import css from './MobileEditDeadlineHourField.module.scss';

type TMobileEditDeadlineHourFieldProps = {
  initialDeadlineHour?: string;
  draftDeadlineHour?: string;
  onSubmitSelectedHour: () => void;
};

const MobileEditDeadlineHourField: React.FC<
  TMobileEditDeadlineHourFieldProps
> = ({ draftDeadlineHour, initialDeadlineHour, onSubmitSelectedHour }) => {
  const control = useBoolean();

  const formattedDeadlineHour = initialDeadlineHour
    ? getLabelByKey(TimeOptions, initialDeadlineHour)
    : 'Chọn hạn chọn món';

  const handleSubmitChanges = () => {
    onSubmitSelectedHour();
    control.setFalse();
  };

  return (
    <>
      <div className={css.mobileInfoContainer} onClick={control.setTrue}>
        <div className={css.label}>{'Ngày kết thúc'}</div>
        <div className={css.mobileDeadlineHourInfo}>
          <IconCalendar />
          <div className={initialDeadlineHour ? '' : css.placeholder}>
            {formattedDeadlineHour}
          </div>
        </div>
      </div>

      <RenderWhen condition={control.value}>
        <SlideModal
          id="MobileEditDeadlineHourField.slideModal"
          modalTitle="Chọn hạn chọn món"
          isOpen={control.value}
          onClose={control.setFalse}
          containerClassName={css.mobileModalContainer}>
          <div className={css.container}>
            <div className={css.scrollContainer}>
              {TimeOptions.map(({ key, label }) => {
                const optionClasses = classNames(css.option, {
                  [css.optionActive]: key === draftDeadlineHour,
                });

                return (
                  <div key={key} className={optionClasses}>
                    <FieldRadioButton
                      className={css.radioItem}
                      id={`draftDeadlineHour.${key}`}
                      name={'draftDeadlineHour'}
                      value={key}
                      radioButtonWrapperClassName={css.radio}
                    />
                    <label htmlFor={`draftDeadlineHour.${key}`} key={key}>
                      {label}
                    </label>
                  </div>
                );
              })}
            </div>
            <div className={css.actions}>
              <Button variant={'secondary'} onClick={control.setFalse}>
                Hủy
              </Button>
              <Button type="button" onClick={handleSubmitChanges}>
                Áp dụng
              </Button>
            </div>
          </div>
        </SlideModal>
      </RenderWhen>
    </>
  );
};

export default MobileEditDeadlineHourField;
