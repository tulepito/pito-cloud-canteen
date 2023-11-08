/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import Form from '@components/Form/Form';
import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import FieldDropdownSelect from '@components/FormFields/FieldDropdownSelect/FieldDropdownSelect';
import IconClock from '@components/Icons/IconClock/IconClock';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import Toggle from '@components/Toggle/Toggle';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import DayInWeekField from '@pages/admin/order/create/components/DayInWeekField/DayInWeekField';
import { QuizActions } from '@redux/slices/Quiz.slice';
import { generateTimeRangeItems } from '@src/utils/dates';
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
  isGroupOrder: string[];
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
    isGroupOrder,
  } = values;

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
      (isGroupOrder.length > 0 && !deadlineDateInitialValue);
    setFormInvalid?.(formInvalid);
  }, [invalid, JSON.stringify(values)]);

  return (
    <Form onSubmit={handleSubmit}>
      <div className={css.datePickersWrapper}>
        <OrderDateField
          form={form}
          values={values}
          onClick={onClickOrderDates}
        />
        <RenderWhen condition={hasOrderBefore && !reorderOpen}>
          <Toggle
            id="MealDateForm.usePreviousData"
            name="usePreviousData"
            className={classNames(css.toggle, css.input)}
            onClick={handleUsePreviousData}
            status={values?.usePreviousData ? 'on' : 'off'}
            label={usePreviousDataLabel}
          />
        </RenderWhen>

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

        <div className={css.fieldContainer} onClick={onClickIsGroupOrder}>
          <FieldCheckbox
            id="isGroupOrder"
            name="isGroupOrder"
            value="true"
            label="Tôi muốn mời thành viên tham gia chọn món"
          />
        </div>
        <RenderWhen condition={isGroupOrder.length > 0}>
          <div className={css.fieldContainer}>
            <OrderDeadlineField
              form={form}
              values={values}
              onClick={onClickDeadlineDate}
            />
          </div>
        </RenderWhen>
      </div>
    </Form>
  );
};

const MealDateForm: React.FC<TMealDateFormProps> = (props) => {
  return <FinalForm {...props} component={MealDateFormComponent} />;
};

export default MealDateForm;
