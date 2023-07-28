/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import flatMapDeep from 'lodash/flatMapDeep';
import isEmpty from 'lodash/isEmpty';

import Badge, { EBadgeType } from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import IconClose from '@components/Icons/IconClose/IconClose';
import IconFilter from '@components/Icons/IconFilter/IconFilter';
import IntegrationFilterModal from '@components/IntegrationFilterModal/IntegrationFilterModal';
import NamedLink from '@components/NamedLink/NamedLink';
import type { TColumn } from '@components/Table/Table';
import { TableForm } from '@components/Table/Table';
import { parseThousandNumber } from '@helpers/format';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { adminPaths } from '@src/paths';
import { formatTimestamp } from '@src/utils/dates';
import { EOrderDetailTabs } from '@src/utils/enums';
import type { TPagination } from '@src/utils/types';

import PaymentFilterModal from './components/PaymentFilterModal/PaymentFilterModal';
import { filterPayments, makeExcelFile } from './helpers/paymentPartner';
import { PartnerManagePaymentsThunks } from './PartnerManagePayments.slice';

import css from './ManagePayments.module.scss';

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

const ManagePaymentsPage = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const [filters, setFilters] = useState({} as any);
  const [selectedPaymentRecords, setSelectedPaymentRecords] = useState(
    {} as any,
  );
  const [page, setPage] = useState(1);

  const filterPaymentModalController = useBoolean();
  const title = intl.formatMessage({
    id: 'ManagePaymentsPage.title',
  });

  const fetchManagePaymentsRecordsInProgress = useAppSelector(
    (state) => state.PartnerManagePayments.fetchPaymentRecordsInProgress,
  );

  const paymentPartnerRecords = useAppSelector(
    (state) => state.PartnerManagePayments.paymentPartnerRecords,
  );

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
        <div className={css.semiBoldText}>
          {parseThousandNumber(paidAmount)}đ
        </div>
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

  const tableData = useMemo(
    () =>
      flatMapDeep(paymentPartnerRecords, (subOrders, orderId) =>
        flatMapDeep(subOrders, (subOrderData, subOrderDate) => ({
          id: `${orderId}_${subOrderDate}`,
          paymentRecords: [...subOrderData],
        })),
      ),
    [JSON.stringify(paymentPartnerRecords)],
  );

  const formattedTableData = tableData.map((item) => {
    const { id, paymentRecords } = item;
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

  const filteredTableData = filterPayments(formattedTableData, filters);

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
    dispatch(PartnerManagePaymentsThunks.loadData());
  }, [dispatch]);

  const onClearFilters = () => {
    setFilters({});
  };

  const onRemoveFilter = (key: string) => () => {
    const currentFilters = { ...filters };
    delete currentFilters[key];

    setFilters(currentFilters);
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
            id: `ManagePaymentsPage.filterLabels.${key}`,
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
                <FormattedMessage id="ManagePaymentsPage.actionButton.downloadPayment" />
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
          isLoading={fetchManagePaymentsRecordsInProgress}
          pagination={pagination}
          onCustomPageChange={setPage}
        />
      </div>

      <PaymentFilterModal
        isOpen={filterPaymentModalController.value}
        onClose={filterPaymentModalController.setFalse}
        setFilters={setFilters}
      />
    </div>
  );
};

export default ManagePaymentsPage;
