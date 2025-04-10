import Button from '@components/Button/Button';
import FieldDateRangePicker from '@components/FormFields/FieldDateRangePicker/FieldDateRangePicker';
import SlideModal from '@components/SlideModal/SlideModal';
import { adjustMinDateWithDaySession } from '@helpers/order/prepareDataHelper';
import { useAppSelector } from '@hooks/reduxHooks';

import { useOrderDateSelect } from '../hooks/useOrderDateSelect';
import type { TMealDateFormValues } from '../MealDateForm/MealDateForm';

import css from './OrderDateFieldModalMobile.module.scss';

type TOrderDateFieldModalMobileProps = {
  isOpen: boolean;
  onClose: () => void;
  form: any;
  values: Partial<TMealDateFormValues>;
  selectedTimeRangeOption: string;
  noMinMax?: boolean;
  allowClear?: boolean;
  dateRangeNoLimit?: boolean;
};

const OrderDateFieldModalMobile: React.FC<TOrderDateFieldModalMobileProps> = (
  props,
) => {
  const {
    isOpen,
    onClose,
    form,
    values,
    selectedTimeRangeOption,
    dateRangeNoLimit,
  } = props;
  const {
    startDate,
    endDate,
    minDate,
    maxDate,
    handleUpdateDateRange,
    handleOrderDateRangeChange,
    handleClearDateRange,
  } = useOrderDateSelect({
    form,
    values,
    modalCallback: onClose,
    selectedTimeRangeOption,
    dateRangeNoLimit,
  });

  const daySession = useAppSelector((state) => state.Quiz.quiz?.daySession);
  const newMinDate = adjustMinDateWithDaySession({
    minDate,
    session: daySession,
  });

  const onSubmitOrderDate = () => {
    handleUpdateDateRange();
  };

  return (
    <SlideModal
      id="OrderDateFieldModalMobile"
      isOpen={isOpen}
      onClose={onClose}
      modalTitle="Chọn ngày">
      <FieldDateRangePicker
        id="dateRangeFieldMobile"
        name="dateRangeFieldMobile"
        minDate={props.noMinMax ? undefined : newMinDate || new Date()}
        maxDate={props.noMinMax ? undefined : maxDate}
        className={css.dateRangePicker}
        onChange={handleOrderDateRangeChange}
        selected={startDate}
        startDate={startDate}
        endDate={endDate}
      />
      <div className={css.bottomBtns}>
        <Button className={'flex-1'} variant="secondary" onClick={onClose}>
          Huỷ
        </Button>
        {props.allowClear && (
          <Button
            variant="secondary"
            type="button"
            className={'flex-1'}
            onClick={handleClearDateRange}>
            Xoá
          </Button>
        )}
        <Button
          type="button"
          className={'flex-1'}
          variant="primary"
          onClick={onSubmitOrderDate}>
          Áp dụng
        </Button>
      </div>
    </SlideModal>
  );
};

export default OrderDateFieldModalMobile;
