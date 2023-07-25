import { useEffect, useState } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import addDays from 'date-fns/addDays';
import arrayMutators from 'final-form-arrays';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldDatePicker from '@components/FormFields/FieldDatePicker/FieldDatePicker';
import FieldRecommendSelect from '@components/FormFields/FieldRecommendSelect/FieldRecommendSelect';
import type { TColumn } from '@components/Table/Table';
import Table from '@components/Table/Table';
import { parseThousandNumber } from '@helpers/format';
import { formatTimestamp, getDayOfWeek } from '@src/utils/dates';

import { filterPaymentPartner } from '../../helpers/paymentPartner';

import AddingPaymentTableField from './AddingPaymentTableField';

import css from './AddPartnerPaymentForm.module.scss';

export type TAddPartnerPaymentFormValues = {
  startDate?: number;
  endDate?: number;
  partnerName?: any;
};

type TExtraProps = {
  partnerNameList: string[];
  unPaidPaymentList: any[];
  inProgress?: boolean;
};
type TAddPartnerPaymentFormComponentProps =
  FormRenderProps<TAddPartnerPaymentFormValues> & Partial<TExtraProps>;
type TAddPartnerPaymentFormProps = FormProps<TAddPartnerPaymentFormValues> &
  TExtraProps;

const AddPartnerPaymentFormComponent: React.FC<
  TAddPartnerPaymentFormComponentProps
> = (props) => {
  const {
    handleSubmit,
    values,
    form,
    partnerNameList = [],
    unPaidPaymentList = [],
    inProgress,
  } = props;

  const [unPaidPaymentListFiltered, setUnPaidPaymentListFiltered] =
    useState<any[]>(unPaidPaymentList);

  useEffect(() => {
    setUnPaidPaymentListFiltered(unPaidPaymentList);
  }, [unPaidPaymentList]);

  const minEndDate = addDays(values.startDate!, 1);

  const partnerNameOptions = partnerNameList.map((partnerName) => ({
    value: partnerName,
    label: partnerName,
  }));

  const handleParseInputValue = (value: string) => {
    return parseThousandNumber(value);
  };

  const TABLE_COLUMNS: TColumn[] = [
    {
      key: 'id',
      label: 'ID',
      render: ({ orderTitle, subOrderDate }: any) => (
        <div>{`#${orderTitle}_${getDayOfWeek(+subOrderDate)}`}</div>
      ),
    },
    {
      key: 'subOrderDate',
      label: 'Ngày triển khai',
      render: ({ subOrderDate }: any) => (
        <div>{formatTimestamp(subOrderDate)}</div>
      ),
    },
    {
      key: 'totalAmount',
      label: 'Tổng giá trị',
      render: ({ totalAmount }: any) => (
        <div>{parseThousandNumber(totalAmount)}đ</div>
      ),
    },
    {
      key: 'remainAmount',
      label: 'Chưa thanh toán',
      render: ({ remainAmount }: any) => (
        <div>{parseThousandNumber(remainAmount)}đ</div>
      ),
    },
    {
      key: 'paymentAction',
      label: 'Thanh toán',
      render: ({ totalAmount, paidAmount, orderTitle, subOrderDate, id }) => {
        return (
          <AddingPaymentTableField
            totalAmount={totalAmount}
            paidAmount={paidAmount}
            orderTitle={orderTitle}
            subOrderDate={subOrderDate}
            handleParseInputValue={handleParseInputValue}
            id={id}
            form={form}
            values={values}
          />
        );
      },
    },
  ];

  const submitDisabled = inProgress;

  const setStartDate = (date: number) => {
    form.change('startDate', date);
    if (values.endDate) {
      form.change('endDate', undefined);
    }
  };
  const setEndDate = (date: number) => {
    form.change('endDate', date);
  };

  const filterUnPaidPaymentList = () => {
    setUnPaidPaymentListFiltered(
      filterPaymentPartner(unPaidPaymentListFiltered, {
        startDate: values?.startDate,
        endDate: values?.endDate,
        partnerName: values?.partnerName?.value,
      }),
    );
  };

  const handleSubmitForm = (_values: any) => {
    handleSubmit(_values);
    form.restart();
  };

  return (
    <Form onSubmit={handleSubmitForm}>
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
      <div className={css.fieldInput}>
        <div className={css.label}>Đối tác</div>
        <FieldRecommendSelect
          id="partnerName"
          name="partnerName"
          placeholder="Nhập tên đối tác"
          options={partnerNameOptions}
        />
      </div>
      <div className={css.filterBtn}>
        <Button className={css.btn} onClick={filterUnPaidPaymentList}>
          Tìm kiếm
        </Button>
      </div>
      <div className={css.horizontalDevider}></div>
      <Table columns={TABLE_COLUMNS} data={unPaidPaymentListFiltered} />
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

const AddPartnerPaymentForm: React.FC<TAddPartnerPaymentFormProps> = (
  props,
) => {
  return (
    <FinalForm
      mutators={{ ...arrayMutators }}
      {...props}
      component={AddPartnerPaymentFormComponent}
    />
  );
};

export default AddPartnerPaymentForm;
