import { useIntl } from 'react-intl';
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
  const intl = useIntl();

  const timeRangeOptions = [
    {
      key: 'next7Days',
      label: intl.formatMessage({ id: '7-ngay-tiep-theo' }),
    },
    {
      key: 'nextWeek',
      label: intl.formatMessage({ id: 'tuan-tiep-theo' }),
    },
    {
      key: 'custom',
      label: intl.formatMessage({ id: 'tuy-chi-nh' }),
    },
  ];

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
            {intl.formatMessage({ id: 'huy' })}
          </Button>
          {allowClear && (
            <Button
              variant="inline"
              type="button"
              onClick={handleClearDateRange}>
              {intl.formatMessage({ id: 'xoa' })}
            </Button>
          )}
          <Button
            type="button"
            disabled={!startDate || !endDate}
            onClick={handleUpdateDateRange}>
            {intl.formatMessage({ id: 'ap-dung' })}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderDateFieldModal;
