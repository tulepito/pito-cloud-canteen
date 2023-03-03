import Button, { InlineTextButton } from '@components/Button/Button';
import { FieldSelectComponent } from '@components/FormFields/FieldSelect/FieldSelect';
import Toggle from '@components/Toggle/Toggle';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import { useField, useForm } from 'react-final-form-hooks';
import { FormattedMessage, useIntl } from 'react-intl';

import css from './BookerNewOrder.module.scss';

type TCreateOrderFormProps = {
  companies: {
    id: string;
    name: string;
  }[];
  previousOrders?: {
    id: string;
    name: string;
  }[];
  onSubmit: (values: TCreateOrderFormValues, reject?: boolean) => void;
  onCancel: () => void;
  initialValues?: TCreateOrderFormValues;
  submitInprogress?: boolean;
  submitError?: any;
  queryInprogress?: boolean;
};

export type TCreateOrderFormValues = {
  company: string;
  usePreviousData?: boolean;
  previousOrder?: string;
};

const validate = (values: TCreateOrderFormValues) => {
  const errors: any = {};
  if (!values.company) {
    errors.company = 'Vui lòng chọn công ty cần đặt đơn';
  }
  if (values.usePreviousData && !values.previousOrder) {
    errors.previousOrder = 'Vui lòng chọn đơn hàng cũ';
  }
  return errors;
};

const CreateOrderForm: React.FC<TCreateOrderFormProps> = ({
  companies = [],
  previousOrders = [],
  onSubmit,
  onCancel,
  initialValues,
  submitInprogress,
  queryInprogress,
}) => {
  const intl = useIntl();

  const handleCustomSubmit = (values: TCreateOrderFormValues) => {
    onSubmit(values);
  };

  const { form, handleSubmit, submitting, hasValidationErrors } =
    useForm<TCreateOrderFormValues>({
      onSubmit: handleCustomSubmit,
      validate,
      initialValues,
      destroyOnUnregister: true,
    });

  const company = useField('company', form);
  const usePreviousData = useField('usePreviousData', form);
  const previousOrder = useField('previousOrder', form);

  const companyValue = company.input.value;
  const isCompanyListEmpty = isEmpty(companies);
  const disabledSubmit =
    isCompanyListEmpty ||
    isEmpty(companyValue) ||
    submitting ||
    hasValidationErrors;
  const isSubmitting = submitting || submitInprogress;

  const companyLabel = intl.formatMessage({
    id: 'CreateOrderForm.companyLabel',
  });
  const usePreviousDataLabel = intl.formatMessage({
    id: 'CreateOrderForm.usePreviousDataLabel',
  });
  const previousOrderLabel = intl.formatMessage({
    id: 'CreateOrderForm.previousOrderLabel',
  });

  const handleUsePreviousData = (checked: boolean) => {
    usePreviousData.input.onChange(checked);
    if (!checked) {
      previousOrder.input.onChange(undefined);
    }
  };

  return (
    <form className={css.root} onSubmit={handleSubmit}>
      <FieldSelectComponent
        className={css.input}
        label={companyLabel}
        input={company.input}
        meta={company.meta}
        id={`company`}
        name="company"
        disabled={isCompanyListEmpty}>
        <option key={'empty'} disabled value={''}>
          {queryInprogress
            ? intl.formatMessage({ id: 'CreateOrderForm.company.loading' })
            : intl.formatMessage({ id: 'CreateOrderForm.company.placeholder' })}
        </option>
        {companies.map((companyItem) => (
          <option key={companyItem.id} value={companyItem.id}>
            {companyItem.name}
          </option>
        ))}
      </FieldSelectComponent>
      <Toggle
        className={classNames(css.toggle, css.input)}
        onClick={handleUsePreviousData}
        status={usePreviousData.input.value ? 'on' : 'off'}
        label={usePreviousDataLabel}
        name={usePreviousData.input.name}
        id={usePreviousData.input.name}
      />
      {usePreviousData.input.value && (
        <FieldSelectComponent
          className={css.input}
          label={previousOrderLabel}
          input={previousOrder.input}
          meta={previousOrder.meta}
          id={`previousOrder`}
          name="previousOrder">
          <option key={'empty'} disabled value={''}>
            {intl.formatMessage({
              id: 'CreateOrderForm.previousOrder.placeholder',
            })}
          </option>
          {previousOrders.map((orderItem) => (
            <option key={orderItem.id} value={orderItem.id}>
              {orderItem.name}
            </option>
          ))}
        </FieldSelectComponent>
      )}
      <Button
        className={css.submitBtn}
        type="submit"
        loadingMode="extend"
        disabled={disabledSubmit}
        inProgress={isSubmitting}
        spinnerClassName={css.spinnerClassName}>
        <FormattedMessage id="CreateOrderForm.submit" />
      </Button>
      <InlineTextButton
        onClick={onCancel}
        className={css.cancelBtn}
        spinnerClassName={css.spinnerClassName}>
        <FormattedMessage id="CreateOrderForm.cancel" />
      </InlineTextButton>
    </form>
  );
};

export default CreateOrderForm;
