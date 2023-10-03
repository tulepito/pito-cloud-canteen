import { useEffect, useMemo } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { FormattedMessage, useIntl } from 'react-intl';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldDropdownSelect from '@components/FormFields/FieldDropdownSelect/FieldDropdownSelect';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import Toggle from '@components/Toggle/Toggle';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { QuizActions, QuizThunks } from '@redux/slices/Quiz.slice';
import { Listing } from '@src/utils/data';
import { EOrderType } from '@src/utils/enums';
import type { TListing } from '@src/utils/types';

import OrderDateField from './quiz/meal-date/OrderDateField/OrderDateField';
import OrderDeadlineField from './quiz/meal-date/OrderDeadlineField/OrderDeadlineField';

import css from './BookerNewOrder.module.scss';

export type TCreateOrderFinalFormValues = {
  company: string;
  usePreviousData?: boolean;
  startDate?: number;
  endDate?: number;
  deadlineDate?: number;
  orderDeadlineHour?: string;
  orderDeadlineMinute?: string;
};

type TExtraProps = {
  companies: {
    id: string;
    name: string;
  }[];
  previousOrders?: {
    id: string;
    name: string;
  }[];
  submitInprogress?: boolean;
  queryInprogress?: boolean;
  hasPreviousOrder?: boolean;
  previousOrder?: TListing;
  reorderOpen?: boolean;
};
type TCreateOrderFinalFormComponentProps =
  FormRenderProps<TCreateOrderFinalFormValues> & Partial<TExtraProps>;
type TCreateOrderFinalFormProps = FormProps<TCreateOrderFinalFormValues> &
  TExtraProps;

const CreateOrderFinalFormComponent: React.FC<
  TCreateOrderFinalFormComponentProps
> = (props) => {
  const {
    handleSubmit,
    values: formValues,
    submitting,
    invalid,
    submitInprogress,
    previousOrder,
    companies = [],
    hasPreviousOrder,
    queryInprogress,
    form,
    reorderOpen,
  } = props;
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const previousOrderListing = Listing(previousOrder!);
  const { orderType = EOrderType.group } = previousOrderListing.getMetadata();
  const isGroupOrder = orderType === EOrderType.group;
  const isCopyPreviousOrder = useAppSelector(
    (state) => state.Quiz.isCopyPreviousOrder,
  );

  const isCompanyListEmpty = isEmpty(companies);
  const isSubmitting = submitting || submitInprogress;
  const disabledSubmit =
    isCompanyListEmpty ||
    isSubmitting ||
    invalid ||
    !formValues?.company ||
    ((!!formValues.usePreviousData || reorderOpen) &&
      (!formValues?.startDate ||
        !formValues?.endDate ||
        (isGroupOrder && !formValues?.deadlineDate)));

  const companyLabel = intl.formatMessage({
    id: 'CreateOrderForm.companyLabel',
  });
  const usePreviousDataLabel = intl.formatMessage({
    id: 'CreateOrderForm.usePreviousDataLabel',
  });

  const handleUsePreviousData = (checked: boolean) => {
    form.change('usePreviousData', checked);
    dispatch(QuizActions.copyPreviousOrder());
    if (!checked) {
      dispatch(QuizActions.clearPreviousOrder());
    }
  };

  const parsedCompanyOptions = useMemo(
    () =>
      companies.map((companyItem) => ({
        key: companyItem.id,
        label: companyItem.name,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(companies)],
  );

  useEffect(() => {
    if (formValues.company && !reorderOpen) {
      dispatch(QuizThunks.queryCompanyOrders(formValues.company));
    }
  }, [formValues.company, dispatch, reorderOpen]);

  return (
    <Form onSubmit={handleSubmit}>
      <FieldDropdownSelect
        className={css.input}
        label={companyLabel}
        id={`company`}
        name="company"
        disabled={isCompanyListEmpty}
        options={parsedCompanyOptions}
        placeholder={
          queryInprogress
            ? intl.formatMessage({ id: 'CreateOrderForm.company.loading' })
            : intl.formatMessage({ id: 'CreateOrderForm.company.placeholder' })
        }
      />

      <RenderWhen condition={hasPreviousOrder && !reorderOpen}>
        <Toggle
          className={classNames(css.toggle, css.input)}
          onClick={handleUsePreviousData}
          status={formValues?.usePreviousData ? 'on' : 'off'}
          label={usePreviousDataLabel}
          name="usePreviousData"
          id="usePreviousData"
        />
      </RenderWhen>
      <RenderWhen condition={!!formValues?.usePreviousData || reorderOpen}>
        <OrderDateField form={form} values={formValues} />
        <RenderWhen condition={isGroupOrder}>
          <div className={css.fieldContainer}>
            <OrderDeadlineField form={form} values={formValues} />
          </div>
        </RenderWhen>
      </RenderWhen>
      <Button
        className={css.submitBtn}
        type="submit"
        loadingMode="extend"
        disabled={disabledSubmit}
        inProgress={isSubmitting}
        spinnerClassName={css.spinnerClassName}>
        <RenderWhen condition={isCopyPreviousOrder || reorderOpen}>
          Tạo đơn hàng
          <RenderWhen.False>
            <FormattedMessage id="CreateOrderForm.submit" />
          </RenderWhen.False>
        </RenderWhen>
      </Button>
    </Form>
  );
};

const CreateOrderFinalForm: React.FC<TCreateOrderFinalFormProps> = (props) => {
  return <FinalForm {...props} component={CreateOrderFinalFormComponent} />;
};

export default CreateOrderFinalForm;
