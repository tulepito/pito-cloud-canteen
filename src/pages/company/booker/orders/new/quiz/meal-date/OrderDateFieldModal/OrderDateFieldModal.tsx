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
  hideQuickSelect?: boolean;
  noMinMax?: boolean;
  allowClear?: boolean;
  dateRangeNoLimit?: boolean;
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
    allowClear,
    dateRangeNoLimit,
  } = props;

  const {
    startDate,
    endDate,
    minDate,
    maxDate,
    handleUpdateDateRange,
    handleOrderDateRangeChange,
    handleTimeRangeSelect,
    handleClearDateRange,
  } = useOrderDateSelect({
    form,
    values,
    selectedTimeRangeOption,
    modalCallback: onClose,
    dateRangeNoLimit,
  });

  const daySession = useAppSelector((state) => state.Quiz.quiz?.daySession);
  const newMinDate = adjustMinDateWithDaySession({
    minDate,
    session: daySession,
  });

  return (
    <div className={css.container}>
      {!props.hideQuickSelect && (
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
      )}
      <div className={css.rightSide}>
        <FieldDateRangePicker
          id="dateRangeField"
          name="dateRangeField"
          selected={startDate}
          onChange={handleOrderDateRangeChange}
          startDate={startDate}
          endDate={endDate}
          shouldHideInput
          minDate={props.noMinMax ? undefined : newMinDate || new Date()}
          maxDate={props.noMinMax ? undefined : maxDate}
        />
        <div className={css.bottomBtns}>
          <Button variant="inline" type="button" onClick={onClose}>
            Huỷ
          </Button>
          {allowClear && (
            <Button
              variant="inline"
              type="button"
              onClick={handleClearDateRange}>
              Xoá
            </Button>
          )}
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
