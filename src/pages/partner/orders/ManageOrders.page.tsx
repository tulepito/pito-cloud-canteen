/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-shadow */
import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { shallowEqual } from 'react-redux';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import Badge, { EBadgeType } from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import IconFilter from '@components/Icons/IconFilter/IconFilter';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import NamedLink from '@components/NamedLink/NamedLink';
import type { TColumn } from '@components/Table/Table';
import { TableForm } from '@components/Table/Table';
import Tooltip from '@components/Tooltip/Tooltip';
import { parseThousandNumber } from '@helpers/format';
import { calculateSubOrderPrice } from '@helpers/orderHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { adminRoutes, partnerPaths } from '@src/paths';
import { findEndDeliveryTime, formatTimestamp } from '@src/utils/dates';
import {
  EOrderDraftStates,
  EOrderStates,
  getLabelByKey,
  ORDER_STATES_OPTIONS,
} from '@utils/enums';
import type { TObject, TTableSortValue } from '@utils/types';

import type { TFilterPartnerOrderFormValues } from './components/FilterPartnerOrderForm';
import FilterPartnerOrderForm from './components/FilterPartnerOrderForm';
import { PartnerManageOrdersThunks } from './ManageOrders.slice';

import css from './ManageOrders.module.scss';

const BADGE_TYPE_BASE_ON_ORDER_STATE = {
  [EOrderDraftStates.draft]: EBadgeType.default,
  [EOrderDraftStates.pendingApproval]: EBadgeType.info,
  [EOrderStates.canceled]: EBadgeType.default,
  [EOrderStates.canceledByBooker]: EBadgeType.default,
  [EOrderStates.completed]: EBadgeType.warning,
  [EOrderStates.inProgress]: EBadgeType.info,
  [EOrderStates.pendingPayment]: EBadgeType.info,
  [EOrderStates.picking]: EBadgeType.warning,
  [EOrderStates.reviewed]: EBadgeType.warning,
};

const BADGE_CLASS_NAME_BASE_ON_ORDER_STATE = {
  [EOrderDraftStates.draft]: css.badgeDefault,
  [EOrderDraftStates.pendingApproval]: css.badgeProcessing,
  [EOrderStates.canceled]: css.badgeDefault,
  [EOrderStates.canceledByBooker]: css.badgeDefault,
  [EOrderStates.completed]: css.badgeSuccess,
  [EOrderStates.inProgress]: css.badgeInProgress,
  [EOrderStates.pendingPayment]: css.badgeProcessing,
  [EOrderStates.picking]: css.badgeWarning,
  [EOrderStates.reviewed]: css.badgeWarning,
};

const TABLE_COLUMN: TColumn[] = [
  {
    key: 'title',
    label: 'ID',
    render: ({ id, date, subOrderTitle }: any) => {
      const titleComponent = (
        <div className={css.orderTitle}>#{subOrderTitle}</div>
      );

      return (
        <NamedLink
          path={partnerPaths.SubOrderDetail}
          params={{
            subOrderId: `${id}_${date.toString()}`,
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
    key: 'startDate',
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
    render: ({ totalPrice }: any) => {
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
    render: ({ state }: { state: EOrderStates | EOrderDraftStates }) => {
      return (
        <Badge
          containerClassName={classNames(
            css.badge,
            BADGE_CLASS_NAME_BASE_ON_ORDER_STATE[state],
          )}
          labelClassName={css.badgeLabel}
          type={BADGE_TYPE_BASE_ON_ORDER_STATE[state] || EBadgeType.default}
          label={getLabelByKey(ORDER_STATES_OPTIONS, state)}
        />
      );
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
      // orderType = EOrderType.group,
      staffName,
      startDate,
      endDate,
      deliveryHour,
      memberOrders = {},
      restaurant,
      lineItems = [],
    } = entity;
    const dayIndex = new Date(Number(date)).getDay();

    const { totalPrice } = calculateSubOrderPrice({
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
        startDate: startDate && formatTimestamp(startDate),
        endDate: endDate && formatTimestamp(endDate),
        state: EOrderDraftStates.pendingApproval,
        deliveryHour: formattedDeliveryHour,
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
        ? b.data[columnName] - a.data[columnName]
        : a.data[columnName] - b.data[columnName];
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
    page = 1,
    name,
    subOrderId,
    startTime,
    endTime,
    status,
  } = router.query;
  const [sortValue, setSortValue] = useState<TTableSortValue>();
  const { queryOrderInProgress, queryOrderError, manageOrdersPagination } =
    useAppSelector((state) => state.Order, shallowEqual);
  const { currentSubOrders = [] } = useAppSelector(
    (state) => state.PartnerManageOrders,
    shallowEqual,
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
  if (queryOrderInProgress) {
    content = <LoadingContainer />;
  } else if (queryOrderError) {
    content = <ErrorMessage message={queryOrderError.message} />;
  } else if (currentSubOrders?.length > 0) {
    content = (
      <>
        <TableForm
          columns={TABLE_COLUMN}
          data={sortedData}
          pagination={manageOrdersPagination}
          paginationPath={adminRoutes.ManageOrders.path}
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, name, subOrderId, startTime, endTime, status]);

  useEffect(() => {
    dispatch(PartnerManageOrdersThunks.loadData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
