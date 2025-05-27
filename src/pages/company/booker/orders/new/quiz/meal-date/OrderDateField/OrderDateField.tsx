import { useState } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import format from 'date-fns/format';

import IconCalendar from '@components/Icons/IconCalender/IconCalender';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import useBoolean from '@hooks/useBoolean';
import { useLocaleTimeProvider } from '@src/translations/TranslationProvider';

import type { TMealDateFormValues } from '../MealDateForm/MealDateForm';
import OrderDateFieldModal from '../OrderDateFieldModal/OrderDateFieldModal';
import OrderDateFieldModalMobile from '../OrderDateFieldModalMobile/OrderDateFieldModalMobile';

import css from './OrderDateField.module.scss';

type OrderDateFieldProps = {
  form: any;
  values: Partial<TMealDateFormValues>;
  onClick?: () => void;
  usePreviousData?: boolean;
  hideLabel?: boolean;
  noMinMax?: boolean;
  hideQuickSelect?: boolean;
  allowClear?: boolean;
  dateRangeNoLimit?: boolean;
};
const OrderDateField: React.FC<OrderDateFieldProps> = (props) => {
  const localeTimeProvider = useLocaleTimeProvider();
  const { usePreviousData = false, form, values, hideLabel, onClick } = props;
  const intl = useIntl();
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
      {!hideLabel && (
        <div className={css.orderDateFieldLabel}>
          {intl.formatMessage({ id: 'OrderDateField.label.selectTimeRange' })}
        </div>
      )}
      <div
        className={css.orderDateFieldInput}
        onClick={handleOrderDateFieldClick}>
        <IconCalendar className="min-w-[16px] min-h-[16px]" />
        <RenderWhen condition={!!startDate && !!endDate}>
          <span>
            {!!startDate &&
              format(startDate!, 'EEE, dd MMMM, yyyy', {
                locale: localeTimeProvider,
              })}{' '}
            -{' '}
            {!!endDate &&
              format(endDate!, 'EEE, dd MMMM, yyyy', {
                locale: localeTimeProvider,
              })}
          </span>
          <RenderWhen.False>
            <span className={css.placeholder}>
              {intl.formatMessage({
                id: 'OrderDateField.placeholder.selectTime',
              })}
            </span>
          </RenderWhen.False>
        </RenderWhen>
      </div>
      <div className={css.orderDateFieldInputMobile}>
        {!hideLabel && (
          <div className={css.label}>
            {intl.formatMessage({ id: 'OrderDateField.label.selectStartDate' })}
          </div>
        )}
        <div
          className={css.fieldInput}
          onClick={orderDateFieldModalMobileController.setTrue}>
          <IconCalendar />
          {hideLabel && !startDate && (
            <span className="text-stone-400">
              {intl.formatMessage({
                id: 'OrderDateField.placeholder.selectStartDate',
              })}
            </span>
          )}
          <RenderWhen condition={!!startDate}>
            <span>
              {!!startDate &&
                format(startDate!, 'EEE, dd MMMM, yyyy', {
                  locale: localeTimeProvider,
                })}
            </span>
            <RenderWhen.False>
              {!hideLabel && (
                <span className={css.placeholder}>
                  {intl.formatMessage({
                    id: 'OrderDateField.placeholder.selectStartDate',
                  })}
                </span>
              )}
            </RenderWhen.False>
          </RenderWhen>
        </div>
      </div>
      <div className={css.orderDateFieldInputMobile}>
        {!hideLabel && (
          <div className={css.label}>
            {intl.formatMessage({ id: 'OrderDateField.label.selectEndDate' })}
          </div>
        )}
        <div
          className={css.fieldInput}
          onClick={orderDateFieldModalMobileController.setTrue}>
          <IconCalendar />
          {hideLabel && !endDate && (
            <span className="text-stone-400">
              {intl.formatMessage({
                id: 'OrderDateField.placeholder.selectEndDate',
              })}
            </span>
          )}
          <RenderWhen condition={!!endDate}>
            <span>
              {!!endDate &&
                format(endDate!, 'EEE, dd MMMM, yyyy', {
                  locale: localeTimeProvider,
                })}
            </span>
            <RenderWhen.False>
              {!hideLabel && (
                <span className={css.placeholder}>
                  {intl.formatMessage({
                    id: 'OrderDateField.placeholder.selectEndDate',
                  })}
                </span>
              )}
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
            hideQuickSelect={props.hideQuickSelect}
            noMinMax={props.noMinMax}
            allowClear={props.allowClear}
            dateRangeNoLimit={props.dateRangeNoLimit}
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
          noMinMax={props.noMinMax}
          allowClear={props.allowClear}
          dateRangeNoLimit={props.dateRangeNoLimit}
        />
      </RenderWhen>
    </div>
  );
};

export default OrderDateField;
