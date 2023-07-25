import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import flatMapDeep from 'lodash/flatMapDeep';
import uniq from 'lodash/uniq';

import Badge, { EBadgeType } from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import IconFilter from '@components/Icons/IconFilter/IconFilter';
import IntegrationFilterModal from '@components/IntegrationFilterModal/IntegrationFilterModal';
import type { TColumn } from '@components/Table/Table';
import { TableForm } from '@components/Table/Table';
import {
  parseThousandNumber,
  parseThousandNumberToInteger,
} from '@helpers/format';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { formatTimestamp } from '@src/utils/dates';

import { generateSKU } from '../order/[orderId]/helpers/AdminOrderDetail';
import KeywordSearchForm from '../partner/components/KeywordSearchForm/KeywordSearchForm';

import AddPartnerPaymentModal from './components/AddPartnerPaymentModal/AddPartnerPaymentModal';
import PaymentFilterModal from './components/PaymentFilterModal/PaymentFilterModal';
import { filterPaymentPartner } from './helpers/paymentPartner';
import { PaymentPartnerThunks } from './PaymentPartner.slice';

import css from './PaymentPartner.module.scss';

const PaymentPartnerPage = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const [filters, setFilters] = useState({} as any);
  const filterPaymentModalController = useBoolean();
  const addPartnerPaymentModalController = useBoolean();
  const title = intl.formatMessage({
    id: 'PaymentPartnerPage.title',
  });

  const fetchPaymentPartnerRecordsInProgress = useAppSelector(
    (state) => state.PaymentPartner.fetchPaymentPartnerRecordsInProgress,
  );

  const paymentPartnerRecords = useAppSelector(
    (state) => state.PaymentPartner.paymentPartnerRecords,
    shallowEqual,
  );

  const createPaymentPartnerRecordsInProgress = useAppSelector(
    (state) => state.PaymentPartner.createPaymentPartnerRecordsInProgress,
  );

  const TABLE_COLUMNS: TColumn[] = [
    {
      key: 'id',
      label: 'ID',
      render: ({ orderTitle }: any) => <div>#{orderTitle}</div>,
    },
    {
      key: 'partnerName',
      label: 'Đối tác',
      render: ({ partnerName }: any) => <div>{partnerName}</div>,
    },
    {
      key: 'subOrderName',
      label: 'Tên đơn hàng',
      render: ({ companyName, subOrderDate }: any) => (
        <div>{`${companyName}_${formatTimestamp(subOrderDate)}`}</div>
      ),
    },
    {
      key: 'subOrderDate',
      label: 'Thời gian',
      render: ({ subOrderDate, deliveryHour }: any) => (
        <div>{`${deliveryHour} ${formatTimestamp(subOrderDate)}`}</div>
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
      key: 'paidAmount',
      label: 'Đã thanh toán',
      render: ({ paidAmount }: any) => (
        <div>{parseThousandNumber(paidAmount)}đ</div>
      ),
    },
    {
      key: 'remainAmount',
      label: 'Còn lại',
      render: ({ remainAmount }: any) => (
        <div>{parseThousandNumber(remainAmount)}đ</div>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: ({ status }: any) => (
        <div>
          <Badge
            type={status === 'isPaid' ? EBadgeType.success : EBadgeType.warning}
            label={status === 'isPaid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
          />
        </div>
      ),
    },
  ];

  const tableData = flatMapDeep(paymentPartnerRecords, (subOrders, orderId) =>
    flatMapDeep(subOrders, (subOrderData, subOrderDate) => ({
      id: `${orderId}_${subOrderDate}`,
      paymentRecords: [...subOrderData],
    })),
  );

  const formattedTableData = tableData.map((item) => {
    const { id, paymentRecords } = item;
    const partnerName = paymentRecords[0].partnerName || '';
    const companyName = paymentRecords[0].companyName || '';
    const subOrderDate = paymentRecords[0].subOrderDate || '';
    const deliveryHour = paymentRecords[0].deliveryHour || '';
    const orderTitle = paymentRecords[0].orderTitle || '';
    const totalAmount = paymentRecords[0].totalPrice || 0;
    const orderId = paymentRecords[0].orderId || '';
    const partnerId = paymentRecords[0].partnerId || '';
    const paidAmount = paymentRecords.reduce(
      (acc, cur) => acc + (cur.amount || 0),
      0,
    );
    const remainAmount = totalAmount - paidAmount;
    const status = remainAmount === 0 ? 'isPaid' : 'isNotPaid';

    return {
      key: id,
      data: {
        id,
        partnerName,
        companyName,
        subOrderDate,
        orderTitle,
        totalAmount,
        paidAmount,
        remainAmount,
        status,
        deliveryHour,
        orderId,
        partnerId,
      },
    };
  });

  const partnerNameList = uniq(
    formattedTableData.map((item) => item.data.partnerName),
  );

  const filteredTableData = filterPaymentPartner(formattedTableData, filters);
  useEffect(() => {
    dispatch(PaymentPartnerThunks.fetchPartnerPaymentRecords());
  }, [dispatch]);

  const onClearFilters = () => {
    setFilters({});
  };

  const onPartnerPaymentRecordsSubmit = async (values: any) => {
    const newPaymentRecords = Object.keys(values).filter((key) =>
      key.includes('paymentAmount'),
    );

    const newPaymentRecordsData = newPaymentRecords.map((key) => {
      const [, orderTitle, subOrderDate, id] = key.split(' - ');
      console.log('orderTitle, subOrderDate, id', key.split(' - '));
      const currentPaymentRecord = formattedTableData.find(
        (_data) => _data.key === id,
      );

      return {
        paymentType: 'partner',
        orderTitle,
        subOrderDate,
        paymentNote: '',
        partnerName: currentPaymentRecord?.data.partnerName,
        companyName: currentPaymentRecord?.data.companyName,
        deliveryHour: currentPaymentRecord?.data.deliveryHour,
        amount: parseThousandNumberToInteger(values[key]),
        totalPrice: currentPaymentRecord?.data.totalAmount,
        orderId: currentPaymentRecord?.data.orderId,
        partnerId: currentPaymentRecord?.data.partnerId,
        SKU: generateSKU('CUSTOMER', currentPaymentRecord?.data.orderId),
      };
    });

    const { meta } = await dispatch(
      PaymentPartnerThunks.createPartnerPaymentRecords(newPaymentRecordsData),
    );

    if (meta.requestStatus === 'fulfilled') {
      addPartnerPaymentModalController.setFalse();
    }
  };

  return (
    <div className={css.root}>
      <div className={css.header}>
        <h1 className={css.title}>{title}</h1>
        <KeywordSearchForm onSubmit={() => {}} />
      </div>
      <div className={css.filterForm}>
        <IntegrationFilterModal
          onClear={onClearFilters}
          leftFilters={
            <Button
              type="button"
              variant="secondary"
              onClick={filterPaymentModalController.setTrue}
              className={css.filterButton}>
              <IconFilter className={css.filterIcon} />
              <FormattedMessage id="IntegrationFilterModal.filterMessage" />
            </Button>
          }
          rightFilters={
            <>
              <Button type="button" variant="secondary">
                <FormattedMessage id="PaymentPartnerPage.actionButton.downloadPayment" />
              </Button>
              <Button
                type="button"
                onClick={addPartnerPaymentModalController.setTrue}>
                <FormattedMessage id="PaymentPartnerPage.actionButton.addPayment" />
              </Button>
            </>
          }
        />
      </div>
      <div className={css.tableWrapper}>
        <TableForm
          columns={TABLE_COLUMNS}
          hasCheckbox
          data={filteredTableData}
          tableBodyCellClassName={css.tableBodyCell}
          // exposeValues={getExposeValues}
          isLoading={fetchPaymentPartnerRecordsInProgress}
        />
      </div>

      <PaymentFilterModal
        isOpen={filterPaymentModalController.value}
        onClose={filterPaymentModalController.setFalse}
        setFilters={setFilters}
      />
      <AddPartnerPaymentModal
        isOpen={addPartnerPaymentModalController.value}
        onClose={addPartnerPaymentModalController.setFalse}
        partnerNameList={partnerNameList}
        paymentList={filterPaymentPartner(formattedTableData, {
          status: ['isNotPaid'],
        })}
        onPartnerPaymentRecordsSubmit={onPartnerPaymentRecordsSubmit}
        inProgress={createPaymentPartnerRecordsInProgress}
      />
    </div>
  );
};

export default PaymentPartnerPage;
