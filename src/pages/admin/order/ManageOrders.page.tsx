/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-shadow */
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { shallowEqual } from 'react-redux';
import classNames from 'classnames';
import addDays from 'date-fns/addDays';
import { useRouter } from 'next/router';

import Badge, { EBadgeType } from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import IconFilter from '@components/Icons/IconFilter/IconFilter';
import IntegrationFilterModal from '@components/IntegrationFilterModal/IntegrationFilterModal';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import NamedLink from '@components/NamedLink/NamedLink';
import type { TColumn } from '@components/Table/Table';
import { TableForm } from '@components/Table/Table';
import StateItem from '@components/TimeLine/StateItem';
import Tooltip from '@components/Tooltip/Tooltip';
import { combineOrderDetailWithPriceInfo } from '@helpers/orderHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { orderAsyncActions, resetOrder } from '@redux/slices/Order.slice';
import { adminPaths, adminRoutes } from '@src/paths';
import { Listing } from '@src/utils/data';
import { formatTimestamp } from '@utils/dates';
import {
  EOrderDraftStates,
  EOrderStates,
  getLabelByKey,
  ORDER_STATES_OPTIONS,
} from '@utils/enums';
import type {
  TIntegrationListing,
  TIntegrationOrderListing,
  TListing,
  TObject,
  TTableSortValue,
} from '@utils/types';
import { parsePrice } from '@utils/validators';

import DownloadColumnListForm from './ManageOrderFilterForms/DownloadColumnListForm/DownloadColumnListForm';
import FilterColumnForm from './ManageOrderFilterForms/FilterColumnForm/FilterColumnForm';
import FilterForm from './ManageOrderFilterForms/FilterForm/FilterForm';

import css from './ManageOrders.module.scss';

const uniqueStrings = (array: string[]) => {
  return array.filter((item, pos) => {
    return array.indexOf(item) === pos;
  });
};

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

const OrderDetailTooltip = ({
  subOrders = [],
}: {
  subOrders: TIntegrationListing[];
}) => {
  const orderDetails = subOrders.reduce(
    (prev: any, subOrder: TIntegrationListing) => {
      const { orderDetail = {} } = subOrder.attributes.metadata || {};
      const subOrderDetails = Object.keys(orderDetail).map((key) => {
        const { transaction, totalPrice = 0 } = orderDetail[key];

        return (
          <div key={key} className={css.orderDetailTooltipItem}>
            <StateItem
              className={css.stateItem}
              data={{ tx: transaction, date: formatTimestamp(Number(key)) }}
            />
            <span>{parsePrice(String(totalPrice))}đ</span>
          </div>
        );
      });

      return [...prev, ...subOrderDetails];
    },
    [],
  );

  return <div className={css.tooltip}>{orderDetails}</div>;
};

const TABLE_COLUMN: TColumn[] = [
  {
    key: 'title',
    label: 'ID',
    render: ({ id: orderId, title, state, subOrders }: any) => {
      const titleComponent = <div className={css.boldText}>#{title}</div>;

      if ([EOrderDraftStates.draft].includes(state)) {
        return (
          <NamedLink path={adminPaths.UpdateDraftOrder} params={{ orderId }}>
            {titleComponent}
          </NamedLink>
        );
      }

      return (
        <NamedLink path={adminPaths.OrderDetail} params={{ orderId }}>
          {subOrders.length > 0 ? (
            <Tooltip
              overlayClassName={css.orderDetailTooltip}
              overlayInnerStyle={{ backgroundColor: '#ffffff' }}
              showArrow={false}
              tooltipContent={<OrderDetailTooltip subOrders={subOrders} />}
              placement="bottomLeft">
              {titleComponent}
            </Tooltip>
          ) : (
            titleComponent
          )}
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
    key: 'address',
    label: 'Địa điểm giao hàng',
    render: (data: any) => {
      return (
        <div className={css.locationRow}>
          <div className={css.companyName}>{data.companyName}</div>
          {data.location || <></>}
        </div>
      );
    },
  },
  {
    key: 'bookerName',
    label: 'Khách hàng',
    render: (data: any) => {
      return <div>{data.displayName}</div>;
    },
  },
  {
    key: 'startDate',
    label: 'Thời gian',
    render: (data: any) => {
      const { startDate, endDate } = data;

      return startDate && endDate ? (
        <div className={css.rowText}>
          <div className={css.deliveryHour}>{data.deliveryHour}</div>
          {data.startDate} - {data.endDate}
        </div>
      ) : (
        <></>
      );
    },
    sortable: true,
  },
  {
    key: 'restaurantName',
    label: 'Đối tác',
    render: ({ restaurants = [] }: any) => {
      const { length } = restaurants;
      const moreThanTwo = restaurants.length > 2;
      const remainLength = length - 2;

      return length > 0 ? (
        <div className={css.rowText}>
          {restaurants.slice(0, 2).map((restaurantName: string) => (
            <div key={restaurantName} className={css.restaurantName}>
              {restaurantName}
            </div>
          ))}
          {moreThanTwo && (
            <div className={css.remainText}>+ {remainLength} đối tác </div>
          )}
        </div>
      ) : (
        <></>
      );
    },
  },
  {
    key: 'staffName',
    label: 'Nhân viên phụ trách',
    render: ({ staffName }: any) => {
      return staffName ? <div>{staffName}</div> : <></>;
    },
    sortable: true,
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

const parseEntitiesToTableData = (
  orders: TIntegrationOrderListing[],
  page: number,
) => {
  if (orders.length === 0) return [];

  return orders.map((entity, index) => {
    const { company, subOrders = [] } = entity;
    const restaurants = subOrders.reduce(
      // eslint-disable-next-line array-callback-return
      (prevSubOrders: any[], subOrder: TIntegrationListing) => {
        const { orderDetail = {} } = subOrder?.attributes?.metadata || {};
        const listRestaurantName = uniqueStrings(
          Object.keys(orderDetail).map((key) => {
            return orderDetail[key]?.restaurant?.restaurantName;
          }),
        );

        return [...prevSubOrders, ...listRestaurantName];
      },
      [],
    );

    const newSubOrders = subOrders.map((plan: TObject) => {
      const { orderDetail: planOrderDetail = {} } = Listing(
        plan as TListing,
      ).getMetadata();

      return {
        ...plan,
        attributes: {
          ...(plan as TListing).attributes,
          metadata: {
            ...(plan as TListing).attributes.metadata,
            orderDetail: combineOrderDetailWithPriceInfo({
              orderDetail: planOrderDetail,
            }),
          },
        },
      };
    });

    const {
      startDate,
      endDate,
      orderState,
      staffName,
      deliveryAddress,
      deliveryHour,
    } = entity?.attributes?.metadata || {};

    return {
      key: entity.id.uuid,
      data: {
        id: entity.id.uuid,
        title: entity.attributes.title,
        orderNumber: (page - 1) * 10 + index + 1,
        location: deliveryAddress?.address,
        companyName: company?.attributes?.profile?.publicData?.companyName,
        displayName: `${company?.attributes.profile?.lastName} ${company?.attributes.profile?.firstName}`,
        startDate: startDate && formatTimestamp(startDate),
        endDate: endDate && formatTimestamp(endDate),
        staffName,
        state: orderState || EOrderDraftStates.pendingApproval,
        orderId: entity?.id?.uuid,
        restaurants,
        subOrders: newSubOrders,
        orderName: entity.attributes.publicData.orderName,
        deliveryHour,
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
    keywords = '',
    meta_state = '',
    meta_endDate,
    meta_startDate,
  } = router.query;
  const [sortValue, setSortValue] = useState<TTableSortValue>();
  const {
    queryOrderInProgress,
    queryOrderError,
    orders = [],
    manageOrdersPagination,
  } = useAppSelector((state) => state.Order, shallowEqual);

  const dataTable = parseEntitiesToTableData(orders, Number(page));

  const sortedData = sortValue ? sortOrders(sortValue, dataTable) : dataTable;

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
  } else if (orders.length > 0) {
    content = (
      <>
        <TableForm
          columns={TABLE_COLUMN}
          data={sortedData}
          pagination={manageOrdersPagination}
          paginationPath={adminRoutes.ManageOrders.path}
          tableBodyCellClassName={css.bodyCell}
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

  const stateAsString = meta_state as string;

  const groupStateString = stateAsString
    ?.split(',')
    .filter((item: string) => !!item);

  useEffect(() => {
    const endDateWithOneMoreDay = addDays(new Date(meta_endDate as string), 1);
    dispatch(
      orderAsyncActions.queryOrders({
        page,
        keywords,
        ...(meta_endDate
          ? { meta_endDate: `,${new Date(endDateWithOneMoreDay).getTime()}` }
          : {}),
        ...(meta_startDate
          ? {
              meta_startDate: `${new Date(
                meta_startDate as string,
              ).getTime()},`,
            }
          : {}),
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    dispatch(resetOrder());
  }, [dispatch]);

  const onClearFilter = () => {
    router.push({
      pathname: adminRoutes.ManageOrders.path,
      query: {},
    });
  };

  const onSubmit = ({
    keywords,
    meta_state,
    meta_startDate,
    meta_endDate,
  }: any) => {
    router.push({
      pathname: adminRoutes.ManageOrders.path,
      query: {
        keywords,
        meta_state: meta_state.join(','),
        ...(meta_startDate
          ? { meta_startDate: new Date(meta_startDate).toISOString() }
          : {}),
        ...(meta_endDate
          ? { meta_endDate: new Date(meta_endDate).toISOString() }
          : {}),
      },
    });
  };

  return (
    <div className={css.root}>
      <div className={css.pageHeader}>
        <h1 className={css.title}>
          <FormattedMessage id="ManageOrders.title" />
        </h1>
        <NamedLink path={adminRoutes.CreateOrder.path}>
          <Button>Tạo đơn</Button>
        </NamedLink>
      </div>
      <div className={css.filterForm}>
        <IntegrationFilterModal
          onClear={onClearFilter}
          leftFilters={
            <Tooltip
              tooltipContent={
                <FilterForm
                  onSubmit={onSubmit}
                  initialValues={{
                    meta_state: groupStateString,
                    keywords,
                    meta_startDate: meta_startDate
                      ? new Date(meta_startDate as string).getTime()
                      : undefined,
                    meta_endDate: meta_endDate
                      ? new Date(meta_endDate as string).getTime()
                      : undefined,
                  }}
                />
              }
              placement="bottomLeft"
              trigger="click"
              overlayInnerStyle={{ backgroundColor: '#fff', padding: 0 }}>
              <Button
                type="button"
                variant="secondary"
                className={css.filterButton}>
                <IconFilter className={css.filterIcon} />
                <FormattedMessage id="IntegrationFilterModal.filterMessage" />
              </Button>
            </Tooltip>
          }
          rightFilters={
            <>
              <Tooltip
                tooltipContent={
                  <FilterColumnForm
                    onSubmit={() => {}}
                    initialValues={{
                      columnName: [],
                    }}
                  />
                }
                placement="bottomRight"
                trigger="click"
                overlayInnerStyle={{ backgroundColor: '#fff', padding: 0 }}>
                <Button variant="secondary">Cột</Button>
              </Tooltip>
              <Tooltip
                tooltipContent={
                  <DownloadColumnListForm
                    onSubmit={() => {}}
                    initialValues={{
                      downloadColumnListName: [],
                    }}
                  />
                }
                placement="bottomRight"
                trigger="click"
                overlayInnerStyle={{ backgroundColor: '#fff', padding: 0 }}>
                <Button variant="secondary">Tải danh sách</Button>
              </Tooltip>
            </>
          }
        />
      </div>
      {content}
    </div>
  );
};

export default ManageOrdersPage;
