import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { OnChange } from 'react-final-form-listeners';
import { useIntl } from 'react-intl';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldDatePicker from '@components/FormFields/FieldDatePicker/FieldDatePicker';
import FieldSelect from '@components/FormFields/FieldSelect/FieldSelect';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';

import css from './FilterPartnerOrderForm.module.scss';

export type TFilterPartnerOrderFormValues = {
  subOrderName: string;
  subOrderId: string;
  subOrderStartTime: number;
  subOrderEndTime: number;
  subOrderStatus: string;
};

type TExtraProps = {};
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
    key: 'isPaid',
    labelId: 'FilterPartnerOrderForm.subOrderStatus.isPaid',
  },
  {
    key: 'isNotPaid',
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

    placeholder: intl.formatMessage({
      id: 'FilterPartnerOrderForm.subOrderStartTime.placeholder',
    }),
  };
  const fieldSubOrderEndTimeProps = {
    name: 'subOrderEndTime',
    id: 'FilterPartnerOrderForm.subOrderEndTime',
    label: intl.formatMessage({
      id: 'FilterPartnerOrderForm.subOrderEndTime.label',
    }),
    minDate: subOrderStartTime,
    placeholder: intl.formatMessage({
      id: 'FilterPartnerOrderForm.subOrderEndTime.placeholder',
    }),
  };

  const fieldSubOrderStatusProps = {
    name: 'subOrderStatus',
    id: 'FilterPartnerOrderForm.subOrderStatus',
    label: intl.formatMessage({
      id: 'FilterPartnerOrderForm.subOrderStatus.label',
    }),
    labelClassName: css.fieldLabel,
    children: (
      <>
        <option disabled value="">
          {intl.formatMessage({
            id: 'FilterPartnerOrderForm.subOrderStatus.placeholder',
          })}
        </option>
        {SUB_ORDER_STATUS_OPTIONS?.map(({ key, labelId }) => (
          <option key={key} value={key}>
            {intl.formatMessage({
              id: labelId,
            })}
          </option>
        ))}
      </>
    ),
  };

  return (
    <Form onSubmit={handleSubmit} className={css.form}>
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
          <OnChange name="subOrderStartTime">{handleStartDateChange}</OnChange>
          <FieldDatePicker {...fieldSubOrderStartTimeProps} />
          <FieldDatePicker {...fieldSubOrderEndTimeProps} />
        </div>
      </div>
      <div className={css.fieldContainer}>
        <FieldSelect {...fieldSubOrderStatusProps} />
      </div>

      <Button className={css.submitBtn} disabled={submitDisabled}>
        {intl.formatMessage({
          id: 'FilterPartnerOrderForm.submitButtonText',
        })}
      </Button>
    </Form>
  );
};

const FilterPartnerOrderForm: React.FC<TFilterPartnerOrderFormProps> = (
  props,
) => {
  return <FinalForm {...props} component={FilterPartnerOrderFormComponent} />;
};

export default FilterPartnerOrderForm;
