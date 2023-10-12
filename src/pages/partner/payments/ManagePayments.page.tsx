/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import flatMapDeep from 'lodash/flatMapDeep';
import isEmpty from 'lodash/isEmpty';

import Badge from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import IconDownload from '@components/Icons/IconDownload/IconDownload';
import IconEmpty from '@components/Icons/IconEmpty/IconEmpty';
import IconFilter from '@components/Icons/IconFilter/IconFilter';
import NamedLink from '@components/NamedLink/NamedLink';
import OutsideClickHandler from '@components/OutsideClickHandler/OutsideClickHandler';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import SlideModal from '@components/SlideModal/SlideModal';
import type { TColumn } from '@components/Table/Table';
import { TableForm } from '@components/Table/Table';
import { parseThousandNumber } from '@helpers/format';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { useBottomScroll } from '@hooks/useBottomScroll';
import { useViewport } from '@hooks/useViewport';
import { adminPaths } from '@src/paths';
import { formatTimestamp } from '@src/utils/dates';
import {
  CONFIGS_BASE_ON_PAYMENT_STATUS,
  EOrderDetailTabs,
  EOrderPaymentStatus,
} from '@src/utils/enums';
import type { TPagination } from '@src/utils/types';

import MobilePaymentCard from './components/MobilePaymentCard/MobilePaymentCard';
import type { TPaymentFilterFormValues } from './components/PaymentFilterForm/PaymentFilterForm';
import PaymentFilterForm from './components/PaymentFilterForm/PaymentFilterForm';
import { filterPayments, makeExcelFile } from './helpers/paymentPartner';
import { PartnerManagePaymentsThunks } from './PartnerManagePayments.slice';

import css from './ManagePayments.module.scss';

const ManagePaymentsPage = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { isMobileLayout } = useViewport();
  const mobileFilterModalControl = useBoolean();
  const [filters, setFilters] = useState({} as any);
  const [selectedPaymentRecords, setSelectedPaymentRecords] = useState(
    {} as any,
  );
  const [page, setPage] = useState(1);
  const tooltipController = useBoolean();

  const shouldShowMobileFilterModal =
    mobileFilterModalControl.value && isMobileLayout;

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
      render: ({ subOrderName }: any) => (
        <div className={css.boldText}>{subOrderName}</div>
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
          paymentRecords: [...subOrderData],
        })),
      ),
    [JSON.stringify(paymentPartnerRecords)],
  );

  const formattedTableData = useMemo(
    () =>
      tableData.map((item) => {
        const { id, paymentRecords = [] } = item;
        const {
          companyName = '',
          subOrderDate = '',
          deliveryHour = '',
          orderTitle: orderTitleFromRecord = '',
          totalPrice: totalAmount = 0,
          orderId = '',
          partnerId = '',
          isAdminConfirmed,
        } = paymentRecords[0] || {};

        const dayIndex = new Date(Number(subOrderDate)).getDay();
        const orderTitle = `${orderTitleFromRecord}-${
          dayIndex === 0 ? 7 : dayIndex
        }`;
        const paidAmount = paymentRecords.reduce(
          (acc, cur) => acc + (cur.amount || 0),
          0,
        );
        const subOrderName = `${companyName}_${formatTimestamp(subOrderDate)}`;
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
            subOrderDate,
            orderTitle,
            totalAmount,
            paidAmount,
            remainAmount,
            status,
            deliveryHour,
            orderId,
            partnerId,
            subOrderName,
          },
        };
      }),
    [JSON.stringify(tableData)],
  );

  const filteredTableData = useMemo(
    () => filterPayments(formattedTableData, filters),
    [JSON.stringify(filters), JSON.stringify(formattedTableData)],
  );
  const filteredTableDataWithPagination = useMemo(
    () =>
      isMobileLayout
        ? filteredTableData.slice(0, page * 10)
        : filteredTableData.slice((page - 1) * 10, page * 10),
    [filteredTableData, page, isMobileLayout],
  );
  const pagination: TPagination = {
    page,
    perPage: 10,
    totalItems: filteredTableData.length,
    totalPages: Math.ceil(filteredTableData.length / 10),
  };

  const handleShowMobileFilterModal = () => {
    mobileFilterModalControl.setTrue();
  };
  const handleCloseMobileFilterModal = () => {
    mobileFilterModalControl.setFalse();
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const getExposeValues = ({ values }: any) => {
    // need set timeout here to wait FormSpy render first to avoid React warning
    setTimeout(() => {
      setSelectedPaymentRecords(values);
    }, 0);
  };

  const handleCloseTooltip = () => {
    tooltipController.setFalse();
  };

  const handleFilterSubmit = (values: TPaymentFilterFormValues) => {
    const { subOrderName, orderTitle, startDate, endDate, status } = values;

    setFilters({
      ...(subOrderName && { subOrderName }),
      ...(orderTitle && { orderTitle }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(status && { status }),
    });

    if (isMobileLayout) {
      handleCloseMobileFilterModal();
    } else {
      handleCloseTooltip();
    }
  };

  const onDownloadPaymentList = () => {
    const hasSelectedPaymentRecords = !isEmpty(
      selectedPaymentRecords.rowCheckbox,
    );

    if (hasSelectedPaymentRecords) {
      const selectedPaymentRecordsData = filteredTableData.filter((item) =>
        selectedPaymentRecords.rowCheckbox.includes(item.key),
      );
      makeExcelFile(selectedPaymentRecordsData);
    } else {
      makeExcelFile(filteredTableData);
    }
  };

  useBottomScroll(() =>
    setPage((p) =>
      isMobileLayout
        ? p + 1 > filteredTableData.length
          ? filteredTableData.length
          : p + 1
        : p,
    ),
  );

  useEffect(() => {
    dispatch(PartnerManagePaymentsThunks.loadData());
  }, []);

  return (
    <div className={css.root}>
      <div className={css.header}>
        <h1 className={css.title}>{title}</h1>
        <Button
          variant="secondary"
          className={css.filterBtn}
          onClick={handleShowMobileFilterModal}>
          <IconFilter className={css.icon} />
        </Button>
      </div>
      <div className={css.actionSection}>
        <div className={css.filterButtonWrapper}>
          <Button
            variant="secondary"
            className={css.filterButton}
            onClick={() => tooltipController.setTrue()}>
            <div className={css.iconContainer}>
              <IconFilter className={css.icon} />
            </div>
            <FormattedMessage id="ManagePaymentsPage.filterButtonText" />
          </Button>

          <RenderWhen condition={tooltipController.value}>
            <div className={css.filterTooltip}>
              <OutsideClickHandler onOutsideClick={handleCloseTooltip}>
                <PaymentFilterForm
                  initialValues={filters}
                  onSubmit={handleFilterSubmit}
                  onClearFilters={handleClearFilters}
                  onClose={handleCloseTooltip}
                />
              </OutsideClickHandler>
            </div>
          </RenderWhen>
        </div>

        <Button
          variant="secondary"
          className={css.downloadButton}
          onClick={onDownloadPaymentList}>
          <div className={css.iconContainer}>
            <IconDownload variant="normal" className={css.icon} />
          </div>
          <FormattedMessage id="ManagePaymentsPage.downloadButtonText" />
        </Button>
      </div>

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

      <RenderWhen condition={isMobileLayout}>
        <RenderWhen condition={isEmpty(filteredTableDataWithPagination)}>
          <div className={css.mobilePaymentsEmpty}>
            <IconEmpty />
            <div>Bạn chưa có hoá đơn cần thanh toán</div>
          </div>
          <RenderWhen.False>
            <div className={css.mobilePaymentsContainer}>
              {filteredTableDataWithPagination.map(
                ({ data: paymentData, key }) => (
                  <MobilePaymentCard key={key} paymentData={paymentData} />
                ),
              )}
            </div>
          </RenderWhen.False>
        </RenderWhen>
      </RenderWhen>

      <SlideModal
        containerClassName={css.mobileFilterModalContainer}
        id="ManagePaymentsPage.MobilePaymentFilterForm"
        modalTitle="Bộ lọc"
        isOpen={shouldShowMobileFilterModal}
        onClose={handleCloseMobileFilterModal}>
        <PaymentFilterForm
          initialValues={filters}
          onSubmit={handleFilterSubmit}
          onClearFilters={handleClearFilters}
          onClose={handleCloseMobileFilterModal}
        />
      </SlideModal>
    </div>
  );
};

export default ManagePaymentsPage;
