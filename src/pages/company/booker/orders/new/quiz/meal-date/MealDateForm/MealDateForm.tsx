/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { OnChange } from 'react-final-form-listeners';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import Form from '@components/Form/Form';
import FieldDropdownSelect from '@components/FormFields/FieldDropdownSelect/FieldDropdownSelect';
import FieldRadioButton from '@components/FormFields/FieldRadioButton/FieldRadioButton';
import IconClock from '@components/Icons/IconClock/IconClock';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import Toggle from '@components/Toggle/Toggle';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import DayInWeekField from '@pages/admin/order/create/components/DayInWeekField/DayInWeekField';
import { QuizActions } from '@redux/slices/Quiz.slice';
import { generateTimeRangeItems } from '@src/utils/dates';
import { EOrderType } from '@src/utils/enums';
import { required } from '@src/utils/validators';

import OrderDateField from '../OrderDateField/OrderDateField';
import OrderDeadlineField from '../OrderDeadlineField/OrderDeadlineField';

import css from './MealDateForm.module.scss';

const TIME_OPTIONS = generateTimeRangeItems({});

export type TMealDateFormValues = {
  startDate: number;
  endDate: number;
  usePreviousData?: boolean;
  deadlineDate: number;
  dayInWeek: string[];
  orderType: EOrderType;
  orderDeadlineHour?: string;
  orderDeadlineMinute?: string;
};

type TExtraProps = {
  hasOrderBefore?: boolean;
  setFormValues: (values: TMealDateFormValues) => void;
  setFormInvalid: (invalid: boolean) => void;
  onClickOrderDates: () => void;
  onClickDeliveryHour: () => void;
  onClickIsGroupOrder: () => void;
  onClickDeadlineDate: () => void;
};
type TMealDateFormComponentProps = FormRenderProps<TMealDateFormValues> &
  Partial<TExtraProps>;
type TMealDateFormProps = FormProps<TMealDateFormValues> & TExtraProps;

const MealDateFormComponent: React.FC<TMealDateFormComponentProps> = (
  props,
) => {
  const {
    handleSubmit,
    form,
    hasOrderBefore = false,
    values,
    setFormValues,
    invalid,
    setFormInvalid,
    onClickOrderDates,
    onClickDeliveryHour,
    onClickIsGroupOrder,
    onClickDeadlineDate,
  } = props;
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const reorderOpen = useAppSelector((state) => state.Quiz.reorderOpen);

  const usePreviousDataLabel = intl.formatMessage({
    id: 'MealDateForm.usePreviousDataLabel',
  });
  const deliveryHourRequiredMessage = intl.formatMessage({
    id: 'MealPlanDateField.deliveryHourRequired',
  });

  const parsedDeliveryHourOptions = useMemo(
    () =>
      TIME_OPTIONS.map((option) => ({
        label: option.label,
        key: option.key,
      })),
    [],
  );

  const {
    startDate: startDateInitialValue,
    endDate: endDateInitialValue,
    deadlineDate: deadlineDateInitialValue,
    orderType = EOrderType.normal,
    usePreviousData,
  } = values;

  const isGroupOrder = orderType === EOrderType.group;

  const handleChangeOrderType = (newValue: string) => {
    if (newValue === EOrderType.group && onClickIsGroupOrder) {
      onClickIsGroupOrder();
    }
  };

  const handleUsePreviousData = (checked: boolean) => {
    form.change('usePreviousData', checked);
    dispatch(QuizActions.copyPreviousOrder());

    if (!checked) {
      dispatch(QuizActions.clearPreviousOrder());
    }
  };

  useEffect(() => {
    setFormValues?.(values);
  }, [JSON.stringify(values)]);

  useEffect(() => {
    const formInvalid =
      invalid ||
      !startDateInitialValue ||
      !endDateInitialValue ||
      (isGroupOrder && !deadlineDateInitialValue);
    setFormInvalid?.(formInvalid);
  }, [invalid, JSON.stringify(values)]);

  return (
    <Form onSubmit={handleSubmit}>
      <div className={css.datePickersWrapper}>
        <OrderDateField
          form={form}
          values={values}
          onClick={onClickOrderDates}
          usePreviousData={usePreviousData}
        />
        <RenderWhen condition={hasOrderBefore && !reorderOpen}>
          <Toggle
            id="MealDateForm.usePreviousData"
            name="usePreviousData"
            className={classNames(css.toggle, css.input)}
            onClick={handleUsePreviousData}
            status={usePreviousData ? 'on' : 'off'}
            label={usePreviousDataLabel}
          />
        </RenderWhen>

        <RenderWhen condition={!usePreviousData}>
          <DayInWeekField
            form={form}
            values={values}
            containerClassName={css.fieldContainer}
            titleClassName={css.fieldTitle}
            fieldGroupClassName={css.fieldGroups}
            title={intl.formatMessage({
              id: 'MealDateForm.dayInWeekField.title',
            })}
          />

          <div onClick={onClickDeliveryHour}>
            <FieldDropdownSelect
              id="deliveryHour"
              name="deliveryHour"
              label={intl.formatMessage({
                id: 'MealPlanDateField.deliveryHourLabel',
              })}
              className={css.fieldContainer}
              leftIcon={<IconClock />}
              validate={required(deliveryHourRequiredMessage)}
              placeholder={intl.formatMessage({
                id: 'OrderDeadlineField.deliveryHour.placeholder',
              })}
              options={parsedDeliveryHourOptions}
            />
          </div>

          <div className={css.orderTypeContainer}>
            <OnChange name="orderType">{handleChangeOrderType}</OnChange>

            <div className={css.orderTypeLabel}>
              {intl.formatMessage({ id: 'MealDateForm.fieldOrderType.label' })}
            </div>
            <FieldRadioButton
              name="orderType"
              id="MealDateForm.orderType.normal"
              value={EOrderType.normal}
              label={intl.formatMessage({
                id: 'MealDateForm.fieldOrderType.normalLabel',
              })}
            />
            <FieldRadioButton
              name="orderType"
              id="MealDateForm.orderType.group"
              value={EOrderType.group}
              label={intl.formatMessage({
                id: 'MealDateForm.fieldOrderType.groupLabel',
              })}
            />
          </div>

          <RenderWhen condition={isGroupOrder}>
            <div className={css.fieldContainer}>
              <OrderDeadlineField
                form={form}
                values={values}
                onClick={onClickDeadlineDate}
              />
            </div>
          </RenderWhen>
        </RenderWhen>
      </div>
    </Form>
  );
};

const MealDateForm: React.FC<TMealDateFormProps> = (props) => {
  return <FinalForm {...props} component={MealDateFormComponent} />;
};

export default MealDateForm;
