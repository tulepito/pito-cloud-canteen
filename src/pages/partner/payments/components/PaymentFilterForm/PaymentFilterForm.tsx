import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { FormattedMessage } from 'react-intl';
import addDays from 'date-fns/addDays';
import arrayMutators from 'final-form-arrays';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldCheckboxGroup from '@components/FormFields/FieldCheckboxGroup/FieldCheckboxGroup';
import FieldDatePicker from '@components/FormFields/FieldDatePicker/FieldDatePicker';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconSearch from '@components/Icons/IconSearch/IconSearch';

import css from './PaymentFilterForm.module.scss';

export type TPaymentFilterFormValues = {
  partnerName?: string;
  orderTitle?: string;
  startDate?: number;
  endDate?: number;
  status?: string[];
};

const PAYMENT_STATUS_OPTIONS = [
  {
    key: 'isNotPaid',
    label: 'Chưa thanh toán',
  },
  {
    key: 'isPaid',
    label: 'Đã thanh toán',
  },
];

type TExtraProps = {
  handleClearFilters: () => void;
};
type TPaymentFilterFormComponentProps =
  FormRenderProps<TPaymentFilterFormValues> & Partial<TExtraProps>;
type TPaymentFilterFormProps = FormProps<TPaymentFilterFormValues> &
  TExtraProps;

const PaymentFilterFormComponent: React.FC<TPaymentFilterFormComponentProps> = (
  props,
) => {
  const { handleSubmit, form, values, handleClearFilters } = props;

  const minEndDate = addDays(values.startDate!, 1);

  const setStartDate = (date: number) => {
    form.change('startDate', date);
    if (values.endDate) {
      form.change('endDate', undefined);
    }
  };
  const setEndDate = (date: number) => {
    form.change('endDate', date);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className={css.fieldInput}>
        <FieldTextInput
          id="partnerName"
          name="partnerName"
          label="Tên đối tác"
          labelClassName={css.label}
          placeholder="Tìm kiếm đối tác"
          leftIcon={<IconSearch />}
        />
      </div>
      <div className={css.fieldInput}>
        <FieldTextInput
          id="orderTitle"
          name="orderTitle"
          label="Mã đơn hàng"
          labelClassName={css.label}
          placeholder="Tìm kiếm đơn hàng"
          leftIcon={<IconSearch />}
        />
      </div>
      <div className={css.fieldInput}>
        <label className={css.label}>
          <FormattedMessage id="ManageOrderPage.createDateLabel" />
        </label>
        <div className={css.dateInputs}>
          <FieldDatePicker
            id="startDate"
            name="startDate"
            selected={values.startDate}
            onChange={setStartDate}
            className={css.dateInput}
            dateFormat={'dd MMMM, yyyy'}
            placeholderText={'Từ'}
            autoComplete="off"
          />
          <FieldDatePicker
            id="endDate"
            name="endDate"
            onChange={setEndDate}
            className={css.dateInput}
            selected={values.endDate}
            dateFormat={'dd MMMM, yyyy'}
            placeholderText={'Đến'}
            autoComplete="off"
            minDate={minEndDate}
            disabled={!values.startDate}
          />
        </div>
      </div>

      <div className={css.fieldInput}>
        <label className={css.label}>Trạng thái</label>
        <FieldCheckboxGroup
          istClassName={css.checkboxGroup}
          id="EditCompanySettingsInformationForm.mealSetting"
          options={PAYMENT_STATUS_OPTIONS}
          name="status"
        />
      </div>

      <div className={css.btnsWrapper}>
        <Button
          variant="secondary"
          type="button"
          className={css.btn}
          onClick={handleClearFilters}>
          Xoá bộ lọc
        </Button>
        <Button className={css.btn}>Áp dụng</Button>
      </div>
    </Form>
  );
};

const PaymentFilterForm: React.FC<TPaymentFilterFormProps> = (props) => {
  return (
    <FinalForm
      mutators={{ ...arrayMutators }}
      {...props}
      component={PaymentFilterFormComponent}
    />
  );
};

export default PaymentFilterForm;
