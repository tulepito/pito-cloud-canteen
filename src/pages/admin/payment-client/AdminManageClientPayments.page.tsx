import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { isEmpty, uniq } from 'lodash';

import Badge, { EBadgeType } from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import IconClose from '@components/Icons/IconClose/IconClose';
import IconFilter from '@components/Icons/IconFilter/IconFilter';
import IntegrationFilterModal from '@components/IntegrationFilterModal/IntegrationFilterModal';
import NamedLink from '@components/NamedLink/NamedLink';
import { type TColumn, TableForm } from '@components/Table/Table';
import {
  parseThousandNumber,
  parseThousandNumberToInteger,
} from '@helpers/format';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { adminPaths } from '@src/paths';
import { formatTimestamp } from '@src/utils/dates';
import { EOrderDetailTabs } from '@src/utils/enums';
import type { TPagination } from '@src/utils/types';

import { generateSKU } from '../order/[orderId]/helpers/AdminOrderDetail';
import KeywordSearchForm from '../partner/components/KeywordSearchForm/KeywordSearchForm';
import PaymentFilterModal from '../payment-partner/components/PaymentFilterModal/PaymentFilterModal';
import {
  filterPaymentPartner,
  makeExcelFile,
} from '../payment-partner/helpers/paymentPartner';
import { PaymentPartnerThunks } from '../payment-partner/PaymentPartner.slice';

import AddClientPaymentModal from './components/AddClientPaymentModal/AddClientPaymentModal';
import { AdminManageClientPaymentsThunks } from './AdminManageClientPayments.slice';
import { filterClientPayment } from './helpers';

import css from './AdminManageClientPayments.module.scss';

const getFilterLabelText = (key: string, value: string | string[]) => {
  switch (key) {
    case 'partnerName':
      return value;
    case 'startDate':
    case 'endDate':
      return formatTimestamp(+value);
    case 'status':
      return Array.isArray(value)
        ? value
            .map((item: string) =>
              item === 'isPaid' ? 'Đã thanh toán' : 'Chưa thanh toán',
            )
            .join(', ')
        : value === 'isPaid'
        ? 'Đã thanh toán'
        : 'Chưa thanh toán';
    default:
      return value;
  }
};

const TABLE_COLUMNS: TColumn[] = [
  {
    key: 'id',
    label: 'ID',
    render: ({ orderTitle, orderId }: any) => (
      <div>
        <NamedLink
          className={css.orderTitle}
          path={adminPaths.OrderDetail}
          params={{ orderId, tab: EOrderDetailTabs.PAYMENT_STATUS }}>
          #{orderTitle}
        </NamedLink>
      </div>
    ),
  },
  {
    key: 'companyName',
    label: 'Công ty',
    render: ({ companyName }: any) => (
      <div className={css.boldText}>{companyName}</div>
    ),
  },
  {
    key: 'subOrderName',
    label: 'Tên đơn hàng',
    render: ({ companyName, subOrderDate }: any) => (
      <div className={css.boldText}>{`${companyName}_${formatTimestamp(
        subOrderDate,
      )}`}</div>
    ),
  },
  {
    key: 'subOrderDate',
    label: 'Thời gian',
    render: ({ subOrderDate, deliveryHour }: any) => (
      <div>
        <div className={css.semiBoldText}>{deliveryHour}</div>
        {`${formatTimestamp(subOrderDate)}`}
      </div>
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
    key: 'paidAmount',
    label: 'Đã thanh toán',
    render: ({ paidAmount }: any) => (
      <div className={css.semiBoldText}>{parseThousandNumber(paidAmount)}đ</div>
    ),
  },
  {
    key: 'remainAmount',
    label: 'Còn lại',
    render: ({ remainAmount }: any) => (
      <div className={css.semiBoldText}>
        {parseThousandNumber(remainAmount)}đ
      </div>
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

const AdminManageClientPaymentsPage = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const [filters, setFilters] = useState({} as any);
  const [selectedPaymentRecords, setSelectedPaymentRecords] = useState(
    {} as any,
  );
  const [page, setPage] = useState(1);

  const filterPaymentModalController = useBoolean();
  const addClientPaymentModalController = useBoolean();
  const title = intl.formatMessage({
    id: 'AdminManageClientPaymentsPage.title',
  });

  const fetchClientPaymentsInProgress = useAppSelector(
    (state) => state.AdminManageClientPayments.fetchClientPaymentsInProgress,
  );

  const clientPayments = useAppSelector(
    (state) => state.AdminManageClientPayments.clientPayments,
  );

  const createClientPaymentsInProgress = useAppSelector(
    (state) => state.AdminManageClientPayments.createClientPaymentsInProgress,
  );

  const formattedTableData = clientPayments.map((item) => {
    const { id } = item;
    const companyName = item.companyName || '';
    const deliveryHour = item.deliveryHour || '';
    const orderTitle = item.orderTitle || '';
    const totalAmount = item.totalPrice || 0;
    const orderId = item.orderId || '';
    const partnerId = item.partnerId || '';
    const paidAmount = item.amount || 0;
    const remainAmount = totalAmount - paidAmount;

    const status = remainAmount === 0 ? 'isPaid' : 'isNotPaid';

    return {
      key: id,
      data: {
        id,
        companyName,
        orderTitle,
        totalAmount,
        remainAmount,
        paidAmount,
        status,
        deliveryHour,
        orderId,
        partnerId,
      },
    };
  });

  const companyNameList = uniq(
    formattedTableData.map((item) => item.data.companyName),
  );

  const filteredTableData = filterClientPayment(formattedTableData, filters);
  const filteredTableDataWithPagination = useMemo(
    () => filteredTableData.slice((page - 1) * 10, page * 10),
    [filteredTableData, page],
  );

  const pagination: TPagination = {
    page,
    perPage: 10,
    totalItems: filteredTableData.length,
    totalPages: Math.ceil(filteredTableData.length / 10),
  };

  useEffect(() => {
    dispatch(AdminManageClientPaymentsThunks.fetchPartnerPaymentRecords());
  }, [dispatch]);

  const onClearFilters = () => {
    setFilters({});
  };

  const onRemoveFilter = (key: string) => () => {
    const currentFilters = { ...filters };
    delete currentFilters[key];

    setFilters(currentFilters);
  };

  const onClientPaymentRecordsSubmit = async (values: any) => {
    const newPaymentRecords = Object.keys(values).filter((key) =>
      key.includes('paymentAmount'),
    );

    const newPaymentRecordsData = newPaymentRecords.map((key) => {
      const [, orderTitle, subOrderDate, id] = key.split(' - ');
      const currentPaymentRecord = formattedTableData.find(
        (_data) => _data.key === id,
      );

      return {
        paymentType: 'client',
        orderTitle,
        subOrderDate,
        paymentNote: '',
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
      addClientPaymentModalController.setFalse();
    }
  };

  const getExposeValues = ({ values }: any) => {
    // need set timeout here to wait FormSpy render first to avoid React warning
    setTimeout(() => {
      setSelectedPaymentRecords(values);
    }, 0);
  };

  const onDownloadPaymentList = () => {
    const hasSelectedPaymentRecords = !isEmpty(selectedPaymentRecords);
    if (hasSelectedPaymentRecords) {
      const selectedPaymentRecordsData = filteredTableData.filter((item) =>
        selectedPaymentRecords.rowCheckbox.includes(item.key),
      );
      makeExcelFile(selectedPaymentRecordsData);
    } else {
      makeExcelFile(filteredTableData);
    }
  };

  const filterLabels = Object.keys(filters).map((key) => {
    return (
      <div key={`${key}-${filters[key]}`} className={css.filterLabel}>
        <span>
          {intl.formatMessage({
            id: `PaymentPartnerPage.filterLabels.${key}`,
          })}
          {' :'}
        </span>{' '}
        <span>{getFilterLabelText(key, filters[key])}</span>
        <IconClose className={css.iconClose} onClick={onRemoveFilter(key)} />
      </div>
    );
  });

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
              <Button
                type="button"
                variant="secondary"
                onClick={onDownloadPaymentList}>
                <FormattedMessage id="PaymentPartnerPage.actionButton.downloadPayment" />
              </Button>
              <Button
                type="button"
                onClick={addClientPaymentModalController.setTrue}>
                <FormattedMessage id="PaymentPartnerPage.actionButton.addPayment" />
              </Button>
            </>
          }
        />
      </div>
      <div className={css.filterLabels}>{filterLabels}</div>
      <div className={css.tableWrapper}>
        <TableForm
          columns={TABLE_COLUMNS}
          hasCheckbox
          data={filteredTableDataWithPagination}
          tableBodyCellClassName={css.tableBodyCell}
          exposeValues={getExposeValues}
          isLoading={fetchClientPaymentsInProgress}
          pagination={pagination}
          onCustomPageChange={setPage}
        />
      </div>

      <PaymentFilterModal
        isOpen={filterPaymentModalController.value}
        onClose={filterPaymentModalController.setFalse}
        setFilters={setFilters}
      />
      <AddClientPaymentModal
        isOpen={addClientPaymentModalController.value}
        onClose={addClientPaymentModalController.setFalse}
        companyNameList={companyNameList}
        paymentList={filterPaymentPartner(formattedTableData, {
          status: ['isNotPaid'],
        })}
        onClientPaymentRecordsSubmit={onClientPaymentRecordsSubmit}
        inProgress={createClientPaymentsInProgress}
      />
    </div>
  );
};

export default AdminManageClientPaymentsPage;
