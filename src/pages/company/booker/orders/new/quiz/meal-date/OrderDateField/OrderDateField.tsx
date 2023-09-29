import format from 'date-fns/format';
import viLocale from 'date-fns/locale/vi';

import IconCalendar from '@components/Icons/IconCalender/IconCalender';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import useBoolean from '@hooks/useBoolean';

import type { TMealDateFormValues } from '../MealDateForm/MealDateForm';
import OrderDateFieldModal from '../OrderDateFieldModal/OrderDateFieldModal';

import css from './OrderDateField.module.scss';

type OrderDateFieldProps = {
  form: any;
  values: TMealDateFormValues;
};
const OrderDateField: React.FC<OrderDateFieldProps> = (props) => {
  const { form, values } = props;
  const orderDateFieldModalController = useBoolean();
  const { startDate, endDate } = values;

  return (
    <div className={css.orderDateFieldWrapper}>
      <div className={css.orderDateFieldLabel}>Chọn thời gian đặt</div>
      <div
        className={css.orderDateFieldInput}
        onClick={orderDateFieldModalController.setTrue}>
        <IconCalendar />
        <RenderWhen condition={!!startDate && !!endDate}>
          <span>
            {!!startDate &&
              format(startDate!, 'EEE, dd MMMM, yyyy', {
                locale: viLocale,
              })}{' '}
            -{' '}
            {!!endDate &&
              format(endDate!, 'EEE, dd MMMM, yyyy', {
                locale: viLocale,
              })}
          </span>
          <RenderWhen.False>
            <span className={css.placeholder}>Chọn thời gian đặt</span>
          </RenderWhen.False>
        </RenderWhen>
      </div>
      <RenderWhen condition={orderDateFieldModalController.value}>
        <div className={css.modalWrapper}>
          <OrderDateFieldModal
            form={form}
            values={values}
            onClose={orderDateFieldModalController.setFalse}
          />
        </div>
      </RenderWhen>
    </div>
  );
};

export default OrderDateField;
