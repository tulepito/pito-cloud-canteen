import { useState } from 'react';
import classNames from 'classnames';
import format from 'date-fns/format';
import viLocale from 'date-fns/locale/vi';

import IconCalendar from '@components/Icons/IconCalender/IconCalender';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import useBoolean from '@hooks/useBoolean';

import type { TMealDateFormValues } from '../MealDateForm/MealDateForm';
import OrderDateFieldModal from '../OrderDateFieldModal/OrderDateFieldModal';
import OrderDateFieldModalMobile from '../OrderDateFieldModalMobile/OrderDateFieldModalMobile';

import css from './OrderDateField.module.scss';

type OrderDateFieldProps = {
  form: any;
  values: Partial<TMealDateFormValues>;
  onClick?: () => void;
  usePreviousData?: boolean;
};
const OrderDateField: React.FC<OrderDateFieldProps> = (props) => {
  const { usePreviousData = false, form, values, onClick } = props;
  const [selectedTimeRangeOption, setSelectedTimeRangeOption] =
    useState<string>('custom');
  const orderDateFieldModalController = useBoolean();
  const orderDateFieldModalMobileController = useBoolean();
  const { startDate, endDate } = values;

  const modalWrapperClasses = classNames(css.modalWrapper, {
    [css.shouldDisplayFixed]: usePreviousData,
  });

  const handleOrderDateFieldClick = () => {
    onClick?.();
    orderDateFieldModalController.setTrue();
  };

  return (
    <div className={css.orderDateFieldWrapper}>
      <div className={css.orderDateFieldLabel}>Chọn thời gian đặt</div>
      <div
        className={css.orderDateFieldInput}
        onClick={handleOrderDateFieldClick}>
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
      <div className={css.orderDateFieldInputMobile}>
        <div className={css.label}>Chọn ngày bắt đầu</div>
        <div
          className={css.fieldInput}
          onClick={orderDateFieldModalMobileController.setTrue}>
          <IconCalendar />
          <RenderWhen condition={!!startDate}>
            <span>
              {!!startDate &&
                format(startDate!, 'EEE, dd MMMM, yyyy', {
                  locale: viLocale,
                })}
            </span>
            <RenderWhen.False>
              <span className={css.placeholder}>Chọn ngày bắt đầu</span>
            </RenderWhen.False>
          </RenderWhen>
        </div>
      </div>
      <div className={css.orderDateFieldInputMobile}>
        <div className={css.label}>Chọn ngày kết thúc</div>
        <div
          className={css.fieldInput}
          onClick={orderDateFieldModalMobileController.setTrue}>
          <IconCalendar />
          <RenderWhen condition={!!endDate}>
            <span>
              {!!endDate &&
                format(endDate!, 'EEE, dd MMMM, yyyy', {
                  locale: viLocale,
                })}
            </span>
            <RenderWhen.False>
              <span className={css.placeholder}>Chọn ngày kết thúc</span>
            </RenderWhen.False>
          </RenderWhen>
        </div>
      </div>
      <RenderWhen condition={orderDateFieldModalController.value}>
        <div className={modalWrapperClasses}>
          <OrderDateFieldModal
            form={form}
            values={values}
            onClose={orderDateFieldModalController.setFalse}
            selectedTimeRangeOption={selectedTimeRangeOption}
            setSelectedTimeRangeOption={setSelectedTimeRangeOption}
          />
        </div>
      </RenderWhen>
      <RenderWhen condition={orderDateFieldModalMobileController.value}>
        <OrderDateFieldModalMobile
          isOpen={orderDateFieldModalMobileController.value}
          onClose={orderDateFieldModalMobileController.setFalse}
          form={form}
          values={values}
          selectedTimeRangeOption={selectedTimeRangeOption}
        />
      </RenderWhen>
    </div>
  );
};

export default OrderDateField;
