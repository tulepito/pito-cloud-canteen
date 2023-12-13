import classNames from 'classnames';

import Button from '@components/Button/Button';
import FieldDateRangePicker from '@components/FormFields/FieldDateRangePicker/FieldDateRangePicker';

import { useOrderDateSelect } from '../hooks/useOrderDateSelect';
import type { TMealDateFormValues } from '../MealDateForm/MealDateForm';

import css from './OrderDateFieldModal.module.scss';

type TOrderDateFieldModalProps = {
  form: any;
  values: Partial<TMealDateFormValues>;
  onClose: () => void;
  selectedTimeRangeOption: string;
  setSelectedTimeRangeOption: (key: string) => void;
};

const timeRangeOptions = [
  {
    key: 'next7Days',
    label: '7 ngày tiếp theo',
  },
  {
    key: 'nextWeek',
    label: 'Tuần tiếp theo',
  },
  {
    key: 'custom',
    label: 'Tùy chỉnh',
  },
];

const OrderDateFieldModal: React.FC<TOrderDateFieldModalProps> = (props) => {
  const {
    form,
    values,
    onClose,
    selectedTimeRangeOption,
    setSelectedTimeRangeOption,
  } = props;

  const {
    startDate,
    endDate,
    minDate,
    maxDate,
    handleUpdateDateRange,
    handleOrderDateRangeChange,
    handleTimeRangeSelect,
  } = useOrderDateSelect({
    form,
    values,
    modalCallback: onClose,
    selectedTimeRangeOption,
  });

  return (
    <div className={css.container}>
      <div className={css.leftSide}>
        {timeRangeOptions.map(({ key, label }) => {
          const handleTimeRangeClick = () => {
            setSelectedTimeRangeOption(key);
            handleTimeRangeSelect(key);
          };

          return (
            <div
              key={key}
              onClick={handleTimeRangeClick}
              className={classNames(css.option, {
                [css.selected]: selectedTimeRangeOption === key,
              })}>
              {label}
            </div>
          );
        })}
      </div>
      <div className={css.rightSide}>
        <FieldDateRangePicker
          id="dateRangeField"
          name="dateRangeField"
          selected={startDate}
          onChange={handleOrderDateRangeChange}
          startDate={startDate}
          endDate={endDate}
          shouldHideInput
          monthsShown={2}
          minDate={minDate || new Date()}
          maxDate={maxDate}
        />
        <div className={css.bottomBtns}>
          <Button variant="inline" type="button" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            type="button"
            disabled={!startDate || !endDate}
            onClick={handleUpdateDateRange}>
            Áp dụng
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderDateFieldModal;
