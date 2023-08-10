import { useImperativeHandle, useRef, useState } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { OnChange } from 'react-final-form-listeners';
import addDays from 'date-fns/addDays';
import arrayMutators from 'final-form-arrays';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldDatePicker from '@components/FormFields/FieldDatePicker/FieldDatePicker';
import FieldRecommendSelect from '@components/FormFields/FieldRecommendSelect/FieldRecommendSelect';
import IconSpinner from '@components/Icons/IconSpinner/IconSpinner';
import type { TColumn } from '@components/Table/Table';
import Table from '@components/Table/Table';
import { parseThousandNumber } from '@helpers/format';
import { formatTimestamp } from '@src/utils/dates';
import type { TCompanyMemberWithDetails, TObject } from '@src/utils/types';

import { filterClientPayment } from '../../helpers';

import AddingClientTableField from './AddingClientTableField';
import FieldMultipleSelectBooker from './FieldMultipleSelectBooker';

import css from './AddClientPaymentForm.module.scss';

export type TAddClientPaymentFormValues = {
  startDate?: number;
  endDate?: number;
  partnerId?: any;
  company?: TObject;
  bookerIds: string[];
  [key: string]: any;
};

type TExtraProps = {
  companyList: TObject[];
  partnerList: TObject[];
  unPaidPaymentList: any[];
  inProgress?: boolean;
  selectInputRef: any;
  onQueryCompanyBookers: (id: string) => void;
  companyBookers: TCompanyMemberWithDetails[];
  queryBookersInProgress: boolean;
};
type AddClientPaymentFormComponentProps =
  FormRenderProps<TAddClientPaymentFormValues> & Partial<TExtraProps>;
type TAddClientPaymentFormProps = FormProps<TAddClientPaymentFormValues> &
  TExtraProps;

const AddClientPaymentFormComponent: React.FC<
  AddClientPaymentFormComponentProps
> = (props) => {
  const {
    handleSubmit,
    values,
    form,
    companyList = [],
    partnerList = [],
    unPaidPaymentList = [],
    inProgress,
    selectInputRef,
    onQueryCompanyBookers,
    companyBookers,
    queryBookersInProgress,
  } = props;

  const selectFieldRef = useRef<any>(null);

  const paymentRecordData = Object.keys(values).filter((key) =>
    key.includes('paymentAmount'),
  );
  const hasPaymentRecordValue = paymentRecordData.some(
    (key) => !!values?.[key],
  );

  const paymentDisabled =
    paymentRecordData.length === 0 ||
    (paymentRecordData.length !== 0 && !hasPaymentRecordValue);

  const [submittedFilters, setSubmittedFilters] = useState<TObject>({});

  useImperativeHandle(selectInputRef, () => selectFieldRef?.current);

  const minEndDate = addDays(values.startDate!, 1);

  const companyNameOptions = companyList.map((company) => ({
    value: company.companyId,
    label: company.companyName,
  }));

  const partnerNameOptions = partnerList.map((partnerName) => ({
    value: partnerName.restaurantId,
    label: partnerName.restaurantName,
  }));

  const handleParseInputValue = (value: string) => {
    return parseThousandNumber(value);
  };

  const TABLE_COLUMNS: TColumn[] = [
    {
      key: 'id',
      label: 'ID',
      render: ({ orderTitle }: any) => (
        <div className={css.orderTitle}>{`#${orderTitle}`}</div>
      ),
    },
    {
      key: 'subOrderDate',
      label: 'Ngày triển khai',
      render: ({ startDate, endDate }: any) => (
        <div>{`${formatTimestamp(startDate)} - ${formatTimestamp(
          endDate,
        )}`}</div>
      ),
    },
    {
      key: 'totalAmount',
      label: 'Tổng giá trị',
      render: ({ totalAmount }: any) => (
        <div className={css.semiBoldText}>
          {parseThousandNumber(totalAmount)}đ
        </div>
      ),
    },
    {
      key: 'remainAmount',
      label: 'Chưa thanh toán',
      render: ({ remainAmount }: any) => (
        <div className={css.semiBoldText}>
          {parseThousandNumber(remainAmount)}đ
        </div>
      ),
    },
    {
      key: 'paymentAction',
      label: 'Thanh toán',
      render: ({ totalAmount, paidAmount, orderTitle, id }) => {
        return (
          <AddingClientTableField
            totalAmount={totalAmount}
            paidAmount={paidAmount}
            orderTitle={orderTitle}
            handleParseInputValue={handleParseInputValue}
            id={id}
            form={form}
            values={values}
          />
        );
      },
    },
  ];

  const submitDisabled = inProgress || paymentDisabled;

  const setStartDate = (date: number) => {
    form.change('startDate', date);
    if (values.endDate) {
      form.change('endDate', undefined);
    }
  };
  const setEndDate = (date: number) => {
    form.change('endDate', date);
  };

  const filters = {
    companyId: values?.company?.value,
    bookerIds: values?.bookerIds,
    startDate: values?.startDate,
    endDate: values?.endDate,
    partnerId: values?.partnerId?.value,
  };

  const filterUnPaidPaymentList = () => {
    setSubmittedFilters(filters);
  };

  const handleSubmitForm = (_values: any) => {
    handleSubmit(_values);
    form.restart();
  };

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const handleCompanyChange = (company: TObject) => {
    const { value } = company;

    form.change('bookerIds', []);

    if (value && onQueryCompanyBookers) {
      onQueryCompanyBookers(value);
    }
  };

  const hasFilters = !!(
    submittedFilters?.companyId ||
    (submittedFilters?.bookerIds && submittedFilters?.bookerIds.length > 0) ||
    (submittedFilters?.startDate && submittedFilters?.endDate) ||
    submittedFilters?.partnerId
  );

  const filteredPayments = filterClientPayment(
    unPaidPaymentList,
    submittedFilters,
  );

  return (
    <Form onSubmit={handleSubmitForm}>
      <OnChange name="company">{handleCompanyChange}</OnChange>
      <div className={css.datesInput}>
        <FieldDatePicker
          id="startDate"
          name="startDate"
          selected={values.startDate}
          onChange={setStartDate}
          className={css.dateInput}
          label="Từ ngày triển khai"
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
          label="Đến ngày triển khai"
          autoComplete="off"
          minDate={minEndDate}
          disabled={!values.startDate}
        />
      </div>
      <div className={css.fieldGroup}>
        <div className={css.fieldInput}>
          <div className={css.label}>Công ty</div>
          <FieldRecommendSelect
            id="company"
            name="company"
            placeholder="Nhập tên khách hàng"
            options={companyNameOptions}
            inputRef={selectFieldRef}
          />
        </div>
        <div className={css.fieldInput}>
          <div className={css.label}>Đối tác</div>
          <FieldRecommendSelect
            id="partnerId"
            name="partnerId"
            placeholder="Nhập tên đối tác"
            options={partnerNameOptions}
            inputRef={selectFieldRef}
          />
        </div>
      </div>
      <div className={css.fieldSelectBooker}>
        {values?.company?.value &&
          (queryBookersInProgress ? (
            <IconSpinner className={css.loading} />
          ) : (
            <FieldMultipleSelectBooker
              name="bookerIds"
              id="bookerIds"
              options={companyBookers}
              values={values}
            />
          ))}
      </div>
      <div className={css.filterBtn}>
        <Button
          className={css.btn}
          disabled={queryBookersInProgress}
          type="button"
          onClick={filterUnPaidPaymentList}>
          Tìm kiếm
        </Button>
      </div>
      <div className={css.horizontalDevider}></div>
      <div className={css.tableWrapper}>
        <Table
          columns={TABLE_COLUMNS}
          data={hasFilters ? filteredPayments : []}
          tableBodyCellClassName={css.tableBodyCell}
        />
      </div>
      <div className={css.paymentBtn}>
        <Button
          type="submit"
          className={css.btn}
          disabled={submitDisabled}
          inProgress={inProgress}>
          Thêm thanh toán
        </Button>
      </div>
    </Form>
  );
};

const AddClientPaymentForm: React.FC<TAddClientPaymentFormProps> = (props) => {
  return (
    <FinalForm
      mutators={{ ...arrayMutators }}
      {...props}
      component={AddClientPaymentFormComponent}
    />
  );
};

export default AddClientPaymentForm;
