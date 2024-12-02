import classNames from 'classnames';

import Button from '@components/Button/Button';
import FieldDateRangePicker from '@components/FormFields/FieldDateRangePicker/FieldDateRangePicker';
import { adjustMinDateWithDaySession } from '@helpers/order/prepareDataHelper';
import { useAppSelector } from '@hooks/reduxHooks';

import { useOrderDateSelect } from '../hooks/useOrderDateSelect';
import type { TMealDateFormValues } from '../MealDateForm/MealDateForm';

import css from './OrderDateFieldModal.module.scss';

type TOrderDateFieldModalProps = {
  form: any;
  values: Partial<TMealDateFormValues>;
  selectedTimeRangeOption: string;
  onClose: () => void;
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
    selectedTimeRangeOption,
    modalCallback: onClose,
  });

  const daySession = useAppSelector((state) => state.Quiz.quiz?.daySession);
  const newMinDate = adjustMinDateWithDaySession({
    minDate,
    session: daySession,
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
          minDate={newMinDate || new Date()}
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
