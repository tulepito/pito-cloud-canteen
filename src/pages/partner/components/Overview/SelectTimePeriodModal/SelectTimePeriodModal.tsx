import IconArrow from '@components/Icons/IconArrow/IconArrow';
import OutsideClickHandler from '@components/OutsideClickHandler/OutsideClickHandler';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import SlideModal from '@components/SlideModal/SlideModal';
import useBoolean from '@hooks/useBoolean';
import { timePeriodOptions } from '@pages/partner/hooks/useControlTimeRange';
import type { ETimePeriodOption } from '@src/utils/enums';

import SelectTimePeriodForm from '../SelectTimePeriodForm/SelectTimePeriodForm';
import SelectTimeRangePeriodForm from '../SelectTimeRangePeriodForm/SelectTimeRangePeriodForm';

import css from './SelectTimePeriodModal.module.scss';

type TSelectTimePeriodModalProps = {
  isOpen: boolean;
  onClose: () => void;
  isMobileLayout: boolean;
  handleTimePeriodChange: (timePeriod: ETimePeriodOption) => void;
  startDate: number;
  endDate: number;
  setStartDate: (startDate: number) => void;
  setEndDate: (endDate: number) => void;
};

const SelectTimePeriodModal: React.FC<TSelectTimePeriodModalProps> = (
  props,
) => {
  const {
    isOpen,
    onClose,
    isMobileLayout,
    handleTimePeriodChange,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
  } = props;
  const selectCustomController = useBoolean();

  const modalTitle = selectCustomController.value ? (
    <div className={css.modalTitle} onClick={selectCustomController.setFalse}>
      <IconArrow direction="left" />
      <span>Quay lại</span>
    </div>
  ) : (
    'Phạm vi ngày'
  );

  const onSubmit = () => {};
  const handleClose = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    onClose();
  };

  if (isMobileLayout)
    return (
      <SlideModal
        id="SelectTimePeriodModal"
        isOpen={isOpen}
        onClose={handleClose}
        modalTitle={modalTitle}
        containerClassName={css.modalContainer}>
        <SelectTimePeriodForm
          onSubmit={onSubmit}
          shouldShowCustomSelect={selectCustomController.value}
          onCustomSelectClick={selectCustomController.setTrue}
          onBackToTimePeriodSelectClick={selectCustomController.setFalse}
          onCloseModal={onClose}
        />
      </SlideModal>
    );

  return (
    <OutsideClickHandler onOutsideClick={onClose}>
      <div className={css.optionsWrapper}>
        {timePeriodOptions.map((option) => {
          const handleSelectTimePeriodClick = (
            e: React.MouseEvent<HTMLElement>,
          ) => {
            e.stopPropagation();
            handleTimePeriodChange(option.key);
            onClose();
          };

          return (
            <div
              key={option.key}
              className={css.option}
              onClick={handleSelectTimePeriodClick}>
              {option.label}
            </div>
          );
        })}
        <div
          className={css.option}
          onMouseEnter={selectCustomController.setTrue}>
          <IconArrow direction="left" />
          Tuỳ chỉnh
          <RenderWhen condition={selectCustomController.value}>
            <div className={css.customTimeModalWrapper}>
              <SelectTimeRangePeriodForm
                onSubmit={onSubmit}
                onCloseModal={handleClose}
                onCloseCustomModal={selectCustomController.setFalse}
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
                handleTimePeriodChange={handleTimePeriodChange}
              />
            </div>
          </RenderWhen>
        </div>
      </div>
    </OutsideClickHandler>
  );
};

export default SelectTimePeriodModal;
