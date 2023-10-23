import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { OnChange } from 'react-final-form-listeners';
import { useIntl } from 'react-intl';
import arrayMutators from 'final-form-arrays';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldCheckboxGroup from '@components/FormFields/FieldCheckboxGroup/FieldCheckboxGroup';
import FieldDatePicker from '@components/FormFields/FieldDatePicker/FieldDatePicker';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import { EOrderPaymentStatus } from '@src/utils/enums';

import css from './FilterPartnerOrderForm.module.scss';

export type TFilterPartnerOrderFormValues = {
  subOrderName: string;
  subOrderId: string;
  subOrderStartTime: number;
  subOrderEndTime: number;
  subOrderStatus: string[];
};

type TExtraProps = {
  onClearFilter: () => void;
};
type TFilterPartnerOrderFormComponentProps =
  FormRenderProps<TFilterPartnerOrderFormValues> & Partial<TExtraProps>;
type TFilterPartnerOrderFormProps = FormProps<TFilterPartnerOrderFormValues> &
  TExtraProps;

const SUB_ORDER_STATUS_OPTIONS = [
  {
    key: 'inProgress',
    labelId: 'FilterPartnerOrderForm.subOrderStatus.inProgress',
  },
  {
    key: 'delivering',
    labelId: 'FilterPartnerOrderForm.subOrderStatus.delivering',
  },
  {
    key: 'delivered',
    labelId: 'FilterPartnerOrderForm.subOrderStatus.delivered',
  },
  {
    key: EOrderPaymentStatus.isPaid,
    labelId: 'FilterPartnerOrderForm.subOrderStatus.isPaid',
  },
  {
    key: EOrderPaymentStatus.isNotPaid,
    labelId: 'FilterPartnerOrderForm.subOrderStatus.isNotPaid',
  },
  {
    key: 'canceled',
    labelId: 'FilterPartnerOrderForm.subOrderStatus.canceled',
  },
];

const FilterPartnerOrderFormComponent: React.FC<
  TFilterPartnerOrderFormComponentProps
> = (props) => {
  const {
    handleSubmit,
    form,
    pristine,
    values: { subOrderStartTime },
    onClearFilter,
  } = props;
  const intl = useIntl();

  const submitDisabled = pristine;

  const handleStartDateChange = (value: any, prevValue: any) => {
    if (value !== prevValue) {
      form.change('subOrderEndTime', undefined);
    }
  };

  const fieldSubOrderIdProps = {
    name: 'subOrderId',
    id: 'FilterPartnerOrderForm.subOrderId',
    label: intl.formatMessage({
      id: 'FilterPartnerOrderForm.fieldSubOrderId.label',
    }),
    labelClassName: css.fieldLabel,
    placeholder: intl.formatMessage({
      id: 'FilterPartnerOrderForm.fieldSubOrderId.placeholder',
    }),
  };

  const fieldSubOrderNameProps = {
    name: 'subOrderName',
    id: 'FilterPartnerOrderForm.subOrderName',
    label: intl.formatMessage({
      id: 'FilterPartnerOrderForm.subOrderName.label',
    }),
    labelClassName: css.fieldLabel,
    placeholder: intl.formatMessage({
      id: 'FilterPartnerOrderForm.subOrderName.placeholder',
    }),
  };

  const fieldSubOrderStartTimeProps = {
    name: 'subOrderStartTime',
    id: 'FilterPartnerOrderForm.subOrderStartTime',
    label: intl.formatMessage({
      id: 'FilterPartnerOrderForm.subOrderStartTime.label',
    }),
    dateFormat: 'dd/MM/yyyy',
    placeholderText: intl.formatMessage({
      id: 'FilterPartnerOrderForm.subOrderStartTime.placeholder',
    }),
    autoComplete: 'off',
  };
  const fieldSubOrderEndTimeProps = {
    name: 'subOrderEndTime',
    id: 'FilterPartnerOrderForm.subOrderEndTime',
    label: intl.formatMessage({
      id: 'FilterPartnerOrderForm.subOrderEndTime.label',
    }),
    minDate: subOrderStartTime,
    dateFormat: 'dd/MM/yyyy',
    placeholderText: intl.formatMessage({
      id: 'FilterPartnerOrderForm.subOrderEndTime.placeholder',
    }),
    autoComplete: 'off',
  };

  const generateStatusOptions = () => {
    return SUB_ORDER_STATUS_OPTIONS.map((option) => {
      return {
        key: option.key,
        label: intl.formatMessage({ id: option.labelId }),
      };
    });
  };

  return (
    <Form onSubmit={handleSubmit} className={css.form}>
      <div className={css.fieldsContainer}>
        <div className={css.fieldContainer}>
          <FieldTextInput {...fieldSubOrderIdProps} />
        </div>
        <div className={css.fieldContainer}>
          <FieldTextInput {...fieldSubOrderNameProps} />
        </div>
        <div className={css.fieldContainer}>
          <div className={css.fieldLabel}>
            {intl.formatMessage({
              id: 'FilterPartnerOrderForm.subOrderTime',
            })}
          </div>
          <div className={css.fieldContainerRow}>
            <OnChange name="subOrderStartTime">
              {handleStartDateChange}
            </OnChange>
            <FieldDatePicker {...fieldSubOrderStartTimeProps} />
            <FieldDatePicker {...fieldSubOrderEndTimeProps} />
          </div>
        </div>
        <div className={css.fieldCheckboxContainer}>
          <label className={css.label}>Trạng thái đơn hàng</label>
          <FieldCheckboxGroup
            itemClassName={css.checkboxGroup}
            id="subOrderStatus"
            options={generateStatusOptions()}
            name="subOrderStatus"
          />
        </div>
      </div>
      <div className={css.btns}>
        <Button
          className={css.clearFilterBtn}
          variant="secondary"
          type="button"
          onClick={onClearFilter}>
          {intl.formatMessage({
            id: 'IntegrationFilterModal.clearBtn',
          })}
        </Button>
        <Button className={css.submitBtn} disabled={submitDisabled}>
          {intl.formatMessage({
            id: 'FilterPartnerOrderForm.submitButtonText',
          })}
        </Button>
      </div>
    </Form>
  );
};

const FilterPartnerOrderForm: React.FC<TFilterPartnerOrderFormProps> = (
  props,
) => {
  return (
    <FinalForm
      mutators={{ ...arrayMutators }}
      {...props}
      component={FilterPartnerOrderFormComponent}
    />
  );
};

export default FilterPartnerOrderForm;
