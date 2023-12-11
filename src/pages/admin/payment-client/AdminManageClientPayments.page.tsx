/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import classNames from 'classnames';
import { flatMapDeep, isEmpty } from 'lodash';

import Badge from '@components/Badge/Badge';
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
import { companyMemberThunks } from '@redux/slices/companyMember.slice';
import { adminPaths } from '@src/paths';
import { formatTimestamp } from '@src/utils/dates';
import {
  CONFIGS_BASE_ON_PAYMENT_STATUS,
  ECompanyPermission,
  EOrderDetailTabs,
  EOrderPaymentStatus,
} from '@src/utils/enums';
import type { TObject, TPagination } from '@src/utils/types';

import { generateSKU } from '../order/[orderId]/helpers/AdminOrderDetail';
import KeywordSearchForm from '../partner/components/KeywordSearchForm/KeywordSearchForm';
import { filterPaymentPartner } from '../payment-partner/helpers/paymentPartner';

import AddClientPaymentModal from './components/AddClientPaymentModal/AddClientPaymentModal';
import PaymentFilterModal from './components/PaymentFilterModal/PaymentFilterModal';
import { AdminManageClientPaymentsThunks } from './AdminManageClientPayments.slice';
import { filterClientPayment, makeClientPaymentExcelFile } from './helpers';

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
    key: 'orderName',
    label: 'Tên đơn hàng',
    render: ({ companyName, startDate, endDate }: any) => (
      <div
        className={classNames(
          css.boldText,
          css.orderName,
        )}>{`${companyName}_${formatTimestamp(startDate)} - ${formatTimestamp(
        endDate,
      )}`}</div>
    ),
  },
  {
    key: 'representatives',
    label: 'Người đại diện',
    render: ({ booker = {} }: any) => {
      const { bookerDisplayName, bookerPhoneNumber } = booker;

      return (
        <div>
          <div>
            <div className={css.memberName}>{bookerDisplayName}</div>
            <div className={css.memberPhoneNumber}>{bookerPhoneNumber}</div>
          </div>
        </div>
      );
    },
  },
  {
    key: 'orderDate',
    label: 'Thời gian',
    render: ({ startDate, endDate, deliveryHour }: any) => (
      <div>
        <div className={css.semiBoldText}>{deliveryHour}</div>
        {`${formatTimestamp(startDate)} - ${formatTimestamp(endDate)}`}
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

export const getUniquePaymentRelationship = (
  list: TObject[],
  uniqueBy: string,
) => {
  const resArr = [] as any[];
  list.forEach((item) => {
    if (!item?.[uniqueBy]) {
      return;
    }
    const i = resArr.findIndex((x) => x[uniqueBy] === item[uniqueBy]);
    if (i <= -1) {
      resArr.push(item);
    }
  });

  return resArr;
};

const AdminManageClientPaymentsPage = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  // * react state
  const [filters, setFilters] = useState({} as any);
  const [selectedPaymentRecords, setSelectedPaymentRecords] = useState(
    {} as any,
  );
  const [page, setPage] = useState(1);
  const filterPaymentModalController = useBoolean();
  const addClientPaymentModalController = useBoolean();
  // * redux state
  const fetchClientPaymentsInProgress = useAppSelector(
    (state) => state.AdminManageClientPayments.fetchClientPaymentsInProgress,
  );
  const clientPaymentsMap = useAppSelector(
    (state) => state.AdminManageClientPayments.clientPaymentsMap,
  );
  const createClientPaymentsInProgress = useAppSelector(
    (state) => state.AdminManageClientPayments.createClientPaymentsInProgress,
  );
  const companyMembers = useAppSelector(
    (state) => state.companyMember.companyMembers,
  );
  const queryMembersInProgress = useAppSelector(
    (state) => state.companyMember.queryMembersInProgress,
  );

  const companyBookers = companyMembers.filter(
    (member) =>
      !!member.id &&
      (member.permission === ECompanyPermission.owner ||
        member.permission === ECompanyPermission.booker),
  );

  const title = intl.formatMessage({
    id: 'AdminManageClientPaymentsPage.title',
  });

  const handleQueryCompanyBookers = (id: string) =>
    dispatch(companyMemberThunks.queryCompanyMembers(id));

  const tableData = useMemo(
    () =>
      flatMapDeep(clientPaymentsMap, (subOrders, orderId) => ({
        id: orderId,
        paymentRecords: [...subOrders].sort((r1, r2) =>
          r1.isHideFromHistory === true
            ? -1
            : r2.isHideFromHistory === true
            ? 1
            : 0,
        ),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(clientPaymentsMap)],
  );

  const formattedTableData = useMemo(
    () =>
      tableData.map((item: any) => {
        const { id, paymentRecords = [] } = item;

        const {
          totalPrice = 0,
          companyName = '',
          startDate = '',
          endDate = '',
          deliveryHour = '',
          orderTitle = '',
          orderId = '',
          partnerId = '',
          booker = '',
          company = '',
          isAdminConfirmed,
        } = paymentRecords[0] || {};
        const restaurants = paymentRecords[0].restaurants || [];

        const paidAmount = paymentRecords.reduce(
          (acc: number, cur: TObject) => acc + (cur.amount || 0),
          0,
        );

        const status =
          isAdminConfirmed === true || totalPrice - paidAmount === 0
            ? EOrderPaymentStatus.isPaid
            : EOrderPaymentStatus.isNotPaid;
        const remainAmount =
          paidAmount > totalPrice ? 0 : totalPrice - paidAmount;

        return {
          key: id,
          data: {
            id,
            companyName,
            orderTitle,
            totalAmount: totalPrice,
            remainAmount,
            paidAmount,
            status,
            deliveryHour,
            orderId,
            partnerId,
            startDate,
            endDate,
            booker,
            restaurants,
            company,
          },
        };
      }),
    [JSON.stringify(tableData)],
  );

  const companyList = getUniquePaymentRelationship(
    formattedTableData
      .filter((item) => !!item.data.company?.companyName)
      .map((item) => item.data.company),
    'companyId',
  );

  const partnerList = getUniquePaymentRelationship(
    formattedTableData.reduce((prev, item) => {
      return [...prev, ...item.data.restaurants];
    }, [] as TObject[]),
    'restaurantId',
  );

  const filteredTableData = useMemo(
    () => filterClientPayment(formattedTableData, filters),
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

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleRemoveFilter = (key: string) => () => {
    const currentFilters = { ...filters };
    delete currentFilters[key];

    setFilters(currentFilters);
  };

  const handleClientPaymentRecordsSubmit = async (values: any) => {
    const newPaymentRecords = Object.keys(values).filter((key) =>
      key.includes('paymentAmount'),
    );

    const newPaymentRecordsData = newPaymentRecords.map((key) => {
      const [, orderTitle, id] = key.split(' - ');
      const currentPaymentRecord = formattedTableData.find(
        (_data) => _data.key === id,
      );

      return {
        paymentType: 'client',
        orderTitle,
        startDate: currentPaymentRecord?.data?.startDate,
        endDate: currentPaymentRecord?.data?.endDate,
        paymentNote: '',
        companyName: currentPaymentRecord?.data?.companyName,
        deliveryHour: currentPaymentRecord?.data?.deliveryHour,
        amount: parseThousandNumberToInteger(values[key]),
        totalPrice: currentPaymentRecord?.data?.totalAmount,
        orderId: currentPaymentRecord?.data?.orderId,
        partnerId: currentPaymentRecord?.data?.partnerId,
        SKU: generateSKU('CUSTOMER', currentPaymentRecord?.data?.orderId),
      };
    });

    const { meta } = await dispatch(
      AdminManageClientPaymentsThunks.adminCreateClientPayment(
        newPaymentRecordsData,
      ),
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

  const handleDownloadPaymentList = () => {
    const hasSelectedPaymentRecords = !isEmpty(selectedPaymentRecords);
    if (hasSelectedPaymentRecords) {
      const selectedPaymentRecordsData = filteredTableData.filter((item) =>
        selectedPaymentRecords.rowCheckbox.includes(item.key),
      );
      makeClientPaymentExcelFile(selectedPaymentRecordsData);
    } else {
      makeClientPaymentExcelFile(filteredTableData);
    }
  };

  const hasSelectedPaymentRecords = !isEmpty(
    selectedPaymentRecords.rowCheckbox,
  );

  const selectedPaymentRecordsData = hasSelectedPaymentRecords
    ? filteredTableData.filter((item) =>
        selectedPaymentRecords.rowCheckbox.includes(item.key),
      )
    : filteredTableData;

  const filterLabels = Object.keys(filters).map((key) => {
    const isArray = Array.isArray(filters[key]);
    if (isArray && filters[key].length <= 0) return <></>;

    return (
      <div key={`${key}-${filters[key]}`} className={css.filterLabel}>
        <span>
          {intl.formatMessage({
            id: `PaymentPartnerPage.filterLabels.${key}`,
          })}
          {' :'}
        </span>{' '}
        <span>{getFilterLabelText(key, filters[key])}</span>
        <IconClose
          className={css.iconClose}
          onClick={handleRemoveFilter(key)}
        />
      </div>
    );
  });

  useEffect(() => {
    if (page === 1 || page === totalPages) {
      dispatch(AdminManageClientPaymentsThunks.fetchClientPaymentRecords());
    }
  }, [dispatch, page]);

  return (
    <div className={css.root}>
      <div className={css.header}>
        <h1 className={css.title}>{title}</h1>
        <KeywordSearchForm className={css.searchForm} onSubmit={() => {}} />
      </div>
      <div className={css.filterForm}>
        <IntegrationFilterModal
          onClear={handleClearFilters}
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
                onClick={handleDownloadPaymentList}>
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
        initialValues={filters}
      />
      {addClientPaymentModalController.value && (
        <AddClientPaymentModal
          isOpen={addClientPaymentModalController.value}
          onClose={addClientPaymentModalController.setFalse}
          companyList={companyList}
          partnerList={partnerList}
          paymentList={filterPaymentPartner(selectedPaymentRecordsData, {
            status: ['isNotPaid'],
          })}
          onQueryCompanyBookers={handleQueryCompanyBookers}
          companyBookers={companyBookers}
          queryBookersInProgress={queryMembersInProgress}
          onClientPaymentRecordsSubmit={handleClientPaymentRecordsSubmit}
          inProgress={createClientPaymentsInProgress}
          hasSelectedPaymentRecords={hasSelectedPaymentRecords}
        />
      )}
    </div>
  );
};

export default AdminManageClientPaymentsPage;
