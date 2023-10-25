import format from 'date-fns/format';
import viLocale from 'date-fns/locale/vi';

import IconCalendar from '@components/Icons/IconCalender/IconCalender';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import useBoolean from '@hooks/useBoolean';

import type { TMealDateFormValues } from '../MealDateForm/MealDateForm';
import OrderDeadlineDateFieldModal from '../OrderDeadlineDateFieldModal/OrderDeadlineDateFieldModal';

import css from './OrderDeadlineField.module.scss';

type OrderDeadlineFieldProps = {
  form: any;
  values: Partial<TMealDateFormValues>;
  onClick?: () => void;
};
const OrderDeadlineField: React.FC<OrderDeadlineFieldProps> = (props) => {
  const { form, values, onClick } = props;
  const { deadlineDate, orderDeadlineHour, orderDeadlineMinute, startDate } =
    values;
  const startOrderDate = startDate ? new Date(startDate) : null;
  const orderDeadlineFieldModalController = useBoolean();

  const handleOrderDeadlineFieldClick = () => {
    onClick?.();
    orderDeadlineFieldModalController.setTrue();
  };

  return (
    <div className={css.orderDeadlineWrapper}>
      <div className={css.orderDeadlineFieldLabel}>
        Chọn thời gian kết thúc chọn món
      </div>
      <div
        className={css.orderDeadlineFieldInput}
        onClick={handleOrderDeadlineFieldClick}>
        <IconCalendar />
        <RenderWhen
          condition={
            !!deadlineDate && !!orderDeadlineHour && !!orderDeadlineMinute
          }>
          <span>
            {`${values.orderDeadlineHour?.padStart(
              2,
              '0',
            )}:${values.orderDeadlineMinute?.padStart(2, '0')} - `}
            {!!deadlineDate &&
              format(deadlineDate!, 'EEE, dd MMMM, yyyy', {
                locale: viLocale,
              })}
          </span>
          <RenderWhen.False>
            <span className={css.placeholder}>
              Chọn thời gian kết thúc chọn món
            </span>
          </RenderWhen.False>
        </RenderWhen>
      </div>

      <RenderWhen condition={orderDeadlineFieldModalController.value}>
        <div className={css.modalWrapper}>
          <OrderDeadlineDateFieldModal
            onClose={orderDeadlineFieldModalController.setFalse}
            form={form}
            values={values}
            startOrderDate={startOrderDate}
          />
        </div>
      </RenderWhen>
    </div>
  );
};

export default OrderDeadlineField;
