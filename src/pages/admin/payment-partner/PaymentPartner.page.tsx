/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import flatMapDeep from 'lodash/flatMapDeep';
import isEmpty from 'lodash/isEmpty';
import uniq from 'lodash/uniq';

import Badge from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import IconClose from '@components/Icons/IconClose/IconClose';
import IconFilter from '@components/Icons/IconFilter/IconFilter';
import IntegrationFilterModal from '@components/IntegrationFilterModal/IntegrationFilterModal';
import NamedLink from '@components/NamedLink/NamedLink';
import OutsideClickHandler from '@components/OutsideClickHandler/OutsideClickHandler';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import type { TColumn } from '@components/Table/Table';
import { TableForm } from '@components/Table/Table';
import {
  parseThousandNumber,
  parseThousandNumberToInteger,
} from '@helpers/format';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { filterPayments } from '@pages/partner/payments/helpers/paymentPartner';
import { adminPaths } from '@src/paths';
import { formatTimestamp, getDayOfWeek } from '@src/utils/dates';
import {
  CONFIGS_BASE_ON_PAYMENT_STATUS,
  EOrderDetailTabs,
  EOrderPaymentStatus,
  EPaymentType,
} from '@src/utils/enums';
import type { TPagination } from '@src/utils/types';

import { generateSKU } from '../order/[orderId]/helpers/AdminOrderDetail';

import AddPartnerPaymentModal from './components/AddPartnerPaymentModal/AddPartnerPaymentModal';
import PaymentFilterModal from './components/PaymentFilterModal/PaymentFilterModal';
import { filterPaymentPartner, makeExcelFile } from './helpers/paymentPartner';
import { PaymentPartnerThunks } from './PaymentPartner.slice';

import css from './PaymentPartner.module.scss';

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
            .map(
              (item: string) =>
                CONFIGS_BASE_ON_PAYMENT_STATUS[item as EOrderPaymentStatus]
                  .label,
            )
            .join(', ')
        : value === 'isPaid'
        ? 'Đã thanh toán'
        : 'Chưa thanh toán';
    default:
      return value;
  }
};

const PaymentPartnerPage = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const [filters, setFilters] = useState({} as any);
  const [selectedPaymentRecords, setSelectedPaymentRecords] = useState(
    {} as any,
  );
  const [page, setPage] = useState(1);

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
  );

  const createPaymentPartnerRecordsInProgress = useAppSelector(
    (state) => state.PaymentPartner.createPaymentPartnerRecordsInProgress,
  );

  const TABLE_COLUMNS: TColumn[] = [
    {
      key: 'id',
      label: 'ID',
      render: ({ orderId, subOrderDate, subOrderTitle }: any) => (
        <div>
          <NamedLink
            className={css.orderTitle}
            path={adminPaths.OrderDetail}
            params={{
              orderId,
              tab: EOrderDetailTabs.PAYMENT_STATUS,
              subOrderDate,
            }}>
            {subOrderTitle}
          </NamedLink>
        </div>
      ),
    },
    {
      key: 'partnerName',
      label: 'Đối tác',
      render: ({ partnerName }: any) => (
        <div className={css.boldText}>{partnerName}</div>
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
      render: ({ status }: { status: EOrderPaymentStatus }) => (
        <div>
          <Badge
            type={CONFIGS_BASE_ON_PAYMENT_STATUS[status].badgeType}
            label={CONFIGS_BASE_ON_PAYMENT_STATUS[status].label}
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
          paymentRecords: [...subOrderData].sort((r1, r2) =>
            r1.isHideFromHistory === true
              ? -1
              : r2.isHideFromHistory === true
              ? 1
              : 0,
          ),
        })),
      ),
    [JSON.stringify(paymentPartnerRecords)],
  );

  const formattedTableData = useMemo(
    () =>
      tableData.map((item) => {
        const { id, paymentRecords = [] } = item;
        const {
          partnerName = '',
          companyName = '',
          subOrderDate = '',
          deliveryHour = '',
          orderTitle = '',
          totalPrice: totalAmount = 0,
          orderId = '',
          partnerId = '',
          isAdminConfirmed,
        } = paymentRecords[0] || {};

        const paidAmount = paymentRecords.reduce(
          (acc, cur) => acc + (cur.amount || 0),
          0,
        );
        const status =
          isAdminConfirmed === true || totalAmount - paidAmount === 0
            ? EOrderPaymentStatus.isPaid
            : EOrderPaymentStatus.isNotPaid;

        const remainAmount =
          paidAmount > totalAmount ? 0 : totalAmount - paidAmount;

        return {
          key: id,
          data: {
            id,
            partnerName,
            companyName,
            subOrderDate,
            orderTitle,
            subOrderTitle: `#${orderTitle}-${getDayOfWeek(+subOrderDate)}`,
            totalAmount,
            paidAmount,
            remainAmount,
            status,
            deliveryHour,
            orderId,
            partnerId,
          },
        };
      }),
    [JSON.stringify(tableData)],
  );
  const partnerNameList = uniq(
    formattedTableData.map((item) => item.data.partnerName),
  );

  const filteredTableData = useMemo(
    () => filterPayments(formattedTableData, filters),
    [JSON.stringify(filters), JSON.stringify(formattedTableData)],
  );

  const filteredTableDataWithPagination = useMemo(
    () => filteredTableData.slice((page - 1) * 10, page * 10),
    [filteredTableData, page],
  );
  const totalPages = Math.ceil(filteredTableData.length / 10);

  const pagination: TPagination = {
    page,
    perPage: 10,
    totalItems: filteredTableData.length,
    totalPages,
  };

  useEffect(() => {
    if (page === 1 || page === totalPages) {
      dispatch(PaymentPartnerThunks.fetchPartnerPaymentRecords());
    }
  }, [dispatch, page]);

  const onClearFilters = () => {
    setFilters({});
  };

  const onRemoveFilter = (key: string) => () => {
    const currentFilters = { ...filters };
    delete currentFilters[key];

    setFilters(currentFilters);
  };
  const onPartnerPaymentRecordsSubmit = async (values: any) => {
    const newPaymentRecords = Object.keys(values).filter((key) =>
      key.includes('paymentAmount'),
    );

    const newPaymentRecordsData = newPaymentRecords.map((key) => {
      const [, orderTitle, subOrderDate, id] = key.split(' - ');
      const currentPaymentRecord = formattedTableData.find(
        (_data) => _data.key === id,
      );

      return {
        paymentType: EPaymentType.PARTNER,
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

  const getExposeValues = ({ values }: any) => {
    // need set timeout here to wait FormSpy render first to avoid React warning
    setTimeout(() => {
      setSelectedPaymentRecords(values);
    }, 0);
  };

  const hasSelectedPaymentRecords = !isEmpty(
    selectedPaymentRecords.rowCheckbox,
  );
  const selectedPaymentRecordsData = hasSelectedPaymentRecords
    ? filteredTableData.filter((item) =>
        selectedPaymentRecords.rowCheckbox.includes(item.key),
      )
    : filteredTableData;

  const onDownloadPaymentList = () => {
    makeExcelFile(selectedPaymentRecordsData);
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
      </div>
      <div className={css.filterForm}>
        <IntegrationFilterModal
          onClear={onClearFilters}
          leftFilters={
            <div className={css.filterButtonWrapper}>
              <Button
                type="button"
                variant="secondary"
                onClick={filterPaymentModalController.toggle}
                className={css.filterButton}>
                <IconFilter className={css.filterIcon} />
                <FormattedMessage id="IntegrationFilterModal.filterMessage" />
              </Button>
              <RenderWhen condition={filterPaymentModalController.value}>
                <OutsideClickHandler
                  className={css.tooltipWrapper}
                  onOutsideClick={filterPaymentModalController.setFalse}>
                  <PaymentFilterModal
                    onClose={filterPaymentModalController.setFalse}
                    setFilters={setFilters}
                    setPage={setPage}
                    filters={filters}
                  />
                </OutsideClickHandler>
              </RenderWhen>
            </div>
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
                onClick={addPartnerPaymentModalController.setTrue}>
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
          isLoading={fetchPaymentPartnerRecordsInProgress}
          pagination={pagination}
          onCustomPageChange={setPage}
        />
      </div>
      <RenderWhen condition={addPartnerPaymentModalController.value}>
        <AddPartnerPaymentModal
          isOpen={addPartnerPaymentModalController.value}
          onClose={addPartnerPaymentModalController.setFalse}
          partnerNameList={partnerNameList}
          paymentList={filterPaymentPartner(selectedPaymentRecordsData, {
            status: ['isNotPaid'],
          })}
          hasSelectedPaymentRecords={hasSelectedPaymentRecords}
          onPartnerPaymentRecordsSubmit={onPartnerPaymentRecordsSubmit}
          inProgress={createPaymentPartnerRecordsInProgress}
        />
      </RenderWhen>
    </div>
  );
};

export default PaymentPartnerPage;
