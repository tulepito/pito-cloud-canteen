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
import IconClose from '@components/Icons/IconClose/IconClose';
import IconSearch from '@components/Icons/IconSearch/IconSearch';
import { EOrderPaymentState } from '@src/utils/enums';

import css from './PaymentFilterForm.module.scss';

export type TPaymentFilterFormValues = {
  subOrderName: string;
  orderTitle: string;
  startDate: number;
  endDate: number;
  status: string[];
};

const PAYMENT_STATUS_OPTIONS = [
  {
    key: EOrderPaymentState.isNotPaid,
    label: 'Chưa thanh toán',
  },
  {
    key: EOrderPaymentState.isPaid,
    label: 'Đã thanh toán',
  },
];

type TExtraProps = {
  onClearFilters: () => void;
  onClose: () => void;
};
type TPaymentFilterFormComponentProps =
  FormRenderProps<TPaymentFilterFormValues> & Partial<TExtraProps>;
type TPaymentFilterFormProps = FormProps<TPaymentFilterFormValues> &
  TExtraProps;

const PaymentFilterFormComponent: React.FC<TPaymentFilterFormComponentProps> = (
  props,
) => {
  const {
    handleSubmit,
    form,
    values,
    onClearFilters: handleClearFiltersFromProps,
    onClose,
  } = props;

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

  const handleClearFilters = () => {
    form.reset();

    if (handleClearFiltersFromProps) {
      handleClearFiltersFromProps();
    }
  };

  return (
    <Form onSubmit={handleSubmit} className={css.root}>
      <div className={css.closeContainer}>
        <div>Lọc</div>
        <IconClose className={css.iconClose} onClick={onClose} />
      </div>
      <div>
        <div className={css.fieldInput}>
          <FieldTextInput
            id="orderTitle"
            name="orderTitle"
            label="Mã đơn hàng"
            labelClassName={css.label}
            placeholder="Tìm kiếm mã đơn hàng"
            leftIcon={<IconSearch />}
          />
        </div>
        <div className={css.fieldInput}>
          <FieldTextInput
            id="subOrderName"
            name="subOrderName"
            label="Tên đơn hàng"
            labelClassName={css.label}
            placeholder="Tìm kiếm tên đơn hàng"
            leftIcon={<IconSearch />}
          />
        </div>
        <div className={css.fieldInput}>
          <label className={css.label}>
            <FormattedMessage id="ManagePaymentsPage.createDateLabel" />
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
            listClassName={css.checkboxGroup}
            id="PaymentFilterForm.status"
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
