/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-shadow */
import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useRouter } from 'next/router';

import Badge, { EBadgeType } from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import IconFilter from '@components/Icons/IconFilter/IconFilter';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import NamedLink from '@components/NamedLink/NamedLink';
import SubOrderBadge from '@components/SubOrderBadge/SubOrderBadge';
import type { TColumn } from '@components/Table/Table';
import { TableForm } from '@components/Table/Table';
import Tooltip from '@components/Tooltip/Tooltip';
import { parseThousandNumber } from '@helpers/format';
import { calculateSubOrderPrice } from '@helpers/orderHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { partnerPaths } from '@src/paths';
import { findEndDeliveryTime, formatTimestamp } from '@src/utils/dates';
import { EOrderDraftStates, EOrderType } from '@utils/enums';
import type { TObject, TTableSortValue } from '@utils/types';

import type { TFilterPartnerOrderFormValues } from './components/FilterPartnerOrderForm';
import FilterPartnerOrderForm from './components/FilterPartnerOrderForm';
import {
  PartnerManageOrdersActions,
  PartnerManageOrdersThunks,
} from './ManageOrders.slice';

import css from './ManageOrders.module.scss';

const TABLE_COLUMN: TColumn[] = [
  {
    key: 'id',
    label: 'ID',
    render: ({ id, date, subOrderTitle }: any) => {
      const titleComponent = (
        <div className={css.orderTitle}>#{subOrderTitle}</div>
      );

      return (
        <NamedLink
          path={partnerPaths.SubOrderDetail}
          params={{
            subOrderId: `${id}_${date}`,
          }}>
          {titleComponent}
        </NamedLink>
      );
    },
    sortable: true,
  },
  {
    key: 'orderName',
    label: 'Tên đơn hàng',
    render: ({ orderName }: any) => {
      return <div className={css.orderName}>{orderName || <></>}</div>;
    },
  },
  {
    key: 'time',
    label: 'Thời gian',
    render: (data: any) => {
      const { startDate, endDate, deliveryHour } = data;

      return startDate && endDate ? (
        <div className={css.rowText}>
          <div className={css.deliveryHour}>{deliveryHour}</div>
          {data.startDate} - {data.endDate}
        </div>
      ) : (
        <></>
      );
    },
    sortable: true,
  },
  {
    key: 'staffName',
    label: 'Nhân viên phụ trách',
    render: ({ staffName }: any) => {
      return staffName ? (
        <div className={css.staffName}>{staffName}</div>
      ) : (
        <></>
      );
    },
  },
  {
    key: 'totalPrice',
    label: 'Tổng tiền',
    render: ({ totalPrice }: TObject) => {
      return totalPrice ? (
        <div className={css.totalPrice}>{totalPrice}</div>
      ) : (
        <></>
      );
    },
  },
  {
    key: 'state',
    label: 'Trạng thái',
    render: ({ transaction = {} }: TObject) => {
      return <SubOrderBadge transaction={transaction} />;
    },
    sortable: true,
  },
  {
    key: 'isPaid',
    label: 'Thanh toán',
    render: ({ isPaid }: any) => {
      return (
        <Badge
          containerClassName={css.badge}
          labelClassName={css.badgeLabel}
          type={isPaid ? EBadgeType.success : EBadgeType.warning}
          label={isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
        />
      );
    },
  },
];

const parseEntitiesToTableData = (subOrders: TObject[]) => {
  return subOrders.map((entity) => {
    const {
      orderId,
      date,
      companyName,
      orderTitle,
      orderType = EOrderType.group,
      staffName,
      startDate,
      endDate,
      deliveryHour,
      memberOrders = {},
      restaurant,
      lineItems = [],
      transaction,
    } = entity;
    const dayIndex = new Date(Number(date)).getDay();
    const { totalPrice } = calculateSubOrderPrice({
      orderType,
      data: {
        memberOrders,
        restaurant,
        lineItems,
      },
    });

    const subOrderTitle = `${orderTitle}-${dayIndex > 0 ? dayIndex : 7}`;
    const formattedDeliveryHour = `${deliveryHour}-${findEndDeliveryTime(
      deliveryHour,
    )}`;

    return {
      key: subOrderTitle,
      data: {
        id: orderId,
        date,
        subOrderTitle,
        totalPrice: `${parseThousandNumber(totalPrice)}đ`,
        companyName,
        orderName: `${companyName}_${formatTimestamp(date)}`,
        staffName,
        startDate: startDate ? formatTimestamp(startDate) : '',
        time: Number(startDate),
        endDate: endDate ? formatTimestamp(endDate) : '',
        state: EOrderDraftStates.pendingApproval,
        deliveryHour: formattedDeliveryHour,
        transaction,
        isPaid: false,
      },
    };
  });
};

const sortOrders = ({ columnName, type }: TTableSortValue, data: any) => {
  const isAsc = type === 'asc';

  // eslint-disable-next-line array-callback-return
  return data.sort((a: any, b: any) => {
    if (typeof a.data[columnName] === 'number') {
      return isAsc
        ? a.data[columnName] - b.data[columnName]
        : b.data[columnName] - a.data[columnName];
    }
    if (typeof a.data[columnName] === 'string') {
      if (a.data[columnName] < b.data[columnName]) {
        return isAsc ? -1 : 1;
      }
      if (a.data[columnName] > b.data[columnName]) {
        return isAsc ? 1 : -1;
      }

      return 0;
    }
  });
};

const ManageOrdersPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const {
    query: { page = 1, name, subOrderId, startTime, endTime, status },
    isReady,
  } = router;
  const [sortValue, setSortValue] = useState<TTableSortValue>();

  const isFirstLoad = useAppSelector(
    (state) => state.PartnerManageOrders.isFirstLoad,
  );
  const currentSubOrders = useAppSelector(
    (state) => state.PartnerManageOrders.currentSubOrders,
  );
  const pagination = useAppSelector(
    (state) => state.PartnerManageOrders.pagination,
  );
  const fetchOrderInProgress = useAppSelector(
    (state) => state.PartnerManageOrders.fetchOrderInProgress,
  );
  const fetchOrderError = useAppSelector(
    (state) => state.PartnerManageOrders.fetchOrderError,
  );
  const dataTable = parseEntitiesToTableData(currentSubOrders);

  const sortedData = sortValue ? sortOrders(sortValue, dataTable) : dataTable;

  const initialFilterFormValues = useMemo(
    () => ({
      subOrderName: name as string,
      subOrderId: subOrderId as string,
      subOrderStartTime: Number(startTime || 0),
      subOrderEndTime: Number(endTime || 0),
      subOrderStatus: status as string,
    }),
    [name, subOrderId, startTime, endTime, status],
  );

  const handleSort = (columnName: string) => {
    setSortValue({
      columnName,
      type: sortValue?.type === 'asc' ? 'desc' : 'asc',
    });
  };

  let content;
  if (fetchOrderInProgress) {
    content = <LoadingContainer />;
  } else if (fetchOrderError) {
    content = <ErrorMessage message={fetchOrderError.message} />;
  } else if (currentSubOrders?.length > 0) {
    content = (
      <>
        <TableForm
          columns={TABLE_COLUMN}
          data={sortedData}
          pagination={pagination}
          paginationPath={partnerPaths.ManageOrders}
          shouldReplacePathWhenChangePage
          tableBodyCellClassName={css.bodyCell}
          tableHeadCellClassName={css.headCell}
          handleSort={handleSort}
          sortValue={sortValue}
          tableWrapperClassName={css.tableWrapper}
          tableClassName={css.table}
        />
      </>
    );
  } else {
    content = (
      <p>
        <FormattedMessage id="ManageOrders.noResults" />
      </p>
    );
  }

  const handleFilterChange = ({
    subOrderName: name,
    subOrderId,
    subOrderStartTime: startTime,
    subOrderEndTime: endTime,
    subOrderStatus: status,
  }: TFilterPartnerOrderFormValues) => {
    router.replace({
      pathname: partnerPaths.ManageOrders,
      query: {
        ...(name ? { name } : {}),
        ...(startTime ? { startTime } : {}),
        ...(endTime ? { endTime } : {}),
        ...(status ? { status } : {}),
        ...(subOrderId ? { subOrderId } : {}),
      },
    });
  };

  useEffect(() => {
    if (isReady) {
      dispatch(
        PartnerManageOrdersActions.filterData({
          page: Number(page),
          ...(name ? { name } : {}),
          ...(startTime ? { startTime } : {}),
          ...(endTime ? { endTime } : {}),
          ...(status ? { status } : {}),
          ...(subOrderId ? { subOrderId } : {}),
        }),
      );
    }
  }, [isReady, page, name, subOrderId, startTime, endTime, status]);

  useEffect(() => {
    if (isFirstLoad && isReady) {
      dispatch(PartnerManageOrdersThunks.loadData()).then(() => {
        dispatch(
          PartnerManageOrdersActions.filterData({
            page: Number(page),
            ...(name ? { name } : {}),
            ...(startTime ? { startTime } : {}),
            ...(endTime ? { endTime } : {}),
            ...(status ? { status } : {}),
            ...(subOrderId ? { subOrderId } : {}),
          }),
        );
      });
    }
  }, []);

  return (
    <div className={css.root}>
      <div className={css.pageHeader}>
        <h1 className={css.title}>
          <FormattedMessage id="ManageOrders.title" />
        </h1>
      </div>

      <Tooltip
        overlayClassName={css.filterBtnTooltipOverlay}
        tooltipContent={
          <FilterPartnerOrderForm
            initialValues={initialFilterFormValues}
            onSubmit={handleFilterChange}
          />
        }
        trigger="click"
        placement="bottom">
        <Button variant="secondary" className={css.filterBtn}>
          <div className={css.filterIconContainer}>
            <IconFilter className={css.filterIcon} />
          </div>
          <FormattedMessage id="ManageOrdersPage.filterButtonText" />
        </Button>
      </Tooltip>
      {content}
    </div>
  );
};

export default ManageOrdersPage;
