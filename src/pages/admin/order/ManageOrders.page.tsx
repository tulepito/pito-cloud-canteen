/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-shadow */
import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { shallowEqual } from 'react-redux';
import classNames from 'classnames';
import addDays from 'date-fns/addDays';
import { useRouter } from 'next/router';

import Badge, { EBadgeType } from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconFilter from '@components/Icons/IconFilter/IconFilter';
import IntegrationFilterModal from '@components/IntegrationFilterModal/IntegrationFilterModal';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import NamedLink from '@components/NamedLink/NamedLink';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import type { TColumn } from '@components/Table/Table';
import { TableForm } from '@components/Table/Table';
import StateItem from '@components/TimeLine/StateItem';
import Tooltip from '@components/Tooltip/Tooltip';
import { calculateTotalPriceAndDishes } from '@helpers/order/cartInfoHelper';
import { combineOrderDetailWithPriceInfo } from '@helpers/orderHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { orderAsyncActions, resetOrder } from '@redux/slices/Order.slice';
import { adminPaths, adminRoutes } from '@src/paths';
import { Listing } from '@src/utils/data';
import {
  ETransition,
  txIsCanceled,
  txIsDelivered,
  txIsDelivering,
  txIsInitiated,
} from '@src/utils/transaction';
import { formatTimestamp, getDayOfWeek } from '@utils/dates';
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
  TTransaction,
} from '@utils/types';
import { parsePrice } from '@utils/validators';

import { makeExcelFile } from './helpers/manageOrder';
import type { TDownloadColumnListFormValues } from './ManageOrderFilterForms/DownloadColumnListForm/DownloadColumnListForm';
import DownloadColumnListForm from './ManageOrderFilterForms/DownloadColumnListForm/DownloadColumnListForm';
import type { TFilterColumnFormValues } from './ManageOrderFilterForms/FilterColumnForm/FilterColumnForm';
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
  [EOrderStates.pendingPayment]: EBadgeType.warning,
  [EOrderStates.picking]: EBadgeType.warning,
  [EOrderStates.reviewed]: EBadgeType.warning,

  [ETransition.START_DELIVERY]: EBadgeType.darkBlue,
  [ETransition.COMPLETE_DELIVERY]: EBadgeType.strongSuccess,
  [ETransition.OPERATOR_CANCEL_PLAN]: EBadgeType.strongDanger,
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

  [ETransition.START_DELIVERY]: css.badgeInProgress,
  [ETransition.COMPLETE_DELIVERY]: css.badgeSuccess,
};

const renderBadgeForSubOrder = (
  tx: TTransaction,
  state: EOrderStates | EOrderDraftStates,
) => {
  if (!tx)
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
  if (txIsInitiated(tx)) {
    return (
      <Badge
        labelClassName={css.badgeLabel}
        type={EBadgeType.info}
        label="Đang triển khai"
      />
    );
  }
  if (txIsDelivering(tx)) {
    return (
      <Badge
        labelClassName={css.badgeLabelLight}
        type={EBadgeType.darkBlue}
        label="Đang giao hàng"
      />
    );
  }
  if (txIsDelivered(tx)) {
    return (
      <Badge
        labelClassName={css.badgeLabelLight}
        type={EBadgeType.strongSuccess}
        label="Đã giao hàng"
      />
    );
  }
  if (txIsCanceled(tx)) {
    return (
      <Badge
        labelClassName={css.badgeLabelLight}
        type={EBadgeType.strongDanger}
        label="Huỷ đơn"
      />
    );
  }

  return (
    <Badge
      labelClassName={css.badgeLabelLight}
      type={EBadgeType.strongSuccess}
      label="Đã giao hàng"
    />
  );
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
    render: ({
      id: orderId,
      title,
      state,
      subOrders,
      parentKey,
      timestamp,
    }: any) => {
      const isChildRow = !!parentKey;
      const titleComponent = (
        <div
          className={classNames(
            css.boldText,
            isChildRow && css.firstChildCell,
          )}>
          #{title}
        </div>
      );

      if (isChildRow) {
        return (
          <NamedLink
            path={adminPaths.OrderDetail}
            params={{ orderId: parentKey, timestamp }}>
            {titleComponent}
          </NamedLink>
        );
      }
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
      const { startDate, endDate, parentKey, subOrderDate } = data;

      return startDate && endDate ? (
        <div className={css.rowText}>
          <div className={css.deliveryHour}>{data.deliveryHour}</div>
          {parentKey ? subOrderDate : `${data.startDate} - ${data.endDate}`}
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
    render: ({
      state,
      parentKey,
      tx,
    }: {
      state: EOrderStates | EOrderDraftStates;
      parentKey: string;
      tx: TTransaction;
    }) => {
      return (
        <RenderWhen condition={!!parentKey}>
          {renderBadgeForSubOrder(tx, state)}
          <RenderWhen.False>
            <Badge
              containerClassName={classNames(
                css.badge,
                BADGE_CLASS_NAME_BASE_ON_ORDER_STATE[state],
              )}
              labelClassName={css.badgeLabel}
              type={BADGE_TYPE_BASE_ON_ORDER_STATE[state] || EBadgeType.default}
              label={getLabelByKey(ORDER_STATES_OPTIONS, state)}
            />
          </RenderWhen.False>
        </RenderWhen>
      );
    },
    sortable: true,
  },
  {
    key: 'isPaid',
    label: 'Thanh toán',
    render: ({ isPaid }) => (
      <Badge
        containerClassName={classNames(
          css.badge,
          isPaid ? css.badgeSuccess : css.badgeWarning,
        )}
        labelClassName={css.badgeLabel}
        type={isPaid ? EBadgeType.success : EBadgeType.warning}
        label={isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
      />
    ),
  },
  {
    key: 'isParent',
    label: '',
    render: ({ isParent }, _, collapseRowController) => {
      return (
        isParent && (
          <IconArrow
            direction="right"
            onClick={collapseRowController?.toggle}
            className={classNames(
              css.iconArrow,
              collapseRowController?.value && css.rotate,
            )}
          />
        )
      );
    },
  },
];

const parseEntitiesToTableData = (orders: TIntegrationOrderListing[]) => {
  if (orders.length === 0) return [];

  return orders.map((entity) => {
    const { company, subOrders = [], allRestaurants = [] } = entity;
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

    const orderDetail = subOrders[0]?.attributes?.metadata?.orderDetail || {};
    const fullRestaurantsData = Object.keys(orderDetail).map((key) => {
      return orderDetail[key]?.restaurant;
    });
    const isGroupOrder =
      (entity?.attributes?.metadata?.orderType || 'group') === 'group';
    const { totalDishes } = calculateTotalPriceAndDishes({
      orderDetail,
      isGroupOrder,
    });

    const subOrderDates = Object.keys(orderDetail).map((key) => {
      const { totalDishes: childTotalDishes } = calculateTotalPriceAndDishes({
        orderDetail: { key: orderDetail[key] },
        isGroupOrder,
      });

      return {
        key: `${entity.id.uuid}-${key}`,
        data: {
          id: `${entity.id.uuid}-${key}`,
          title: `${entity.attributes.title}-${getDayOfWeek(+key)}`,
          startDate: startDate && formatTimestamp(startDate),
          endDate: endDate && formatTimestamp(endDate),
          subOrderDate: formatTimestamp(+key, 'dd/MM/yyyy'),
          state: orderState || EOrderDraftStates.pendingApproval,
          orderId: entity?.id?.uuid,
          restaurants: [orderDetail[key]?.restaurant?.restaurantName],
          restaurantId: orderDetail[key]?.restaurant?.id,
          subOrders: newSubOrders,
          orderName: `${
            company?.attributes?.profile?.publicData?.companyName
          }_${formatTimestamp(+key, 'dd/MM/yyyy')}`,
          deliveryHour,
          parentKey: entity.id.uuid,
          tx: orderDetail[key]?.transaction,
          partnerPhoneNumber: orderDetail[key]?.restaurant?.phoneNumber,
          totalDishes: childTotalDishes,
          timestamp: +key,
          partnerLocation: allRestaurants.find(
            (_restaurant) =>
              _restaurant.id.uuid === orderDetail[key]?.restaurant?.id,
          )?.attributes?.publicData?.location?.address,
        },
      };
    });

    return {
      key: entity.id.uuid,
      data: {
        id: entity.id.uuid,
        title: entity.attributes.title,
        location: deliveryAddress?.address,
        companyLocation:
          company?.attributes?.profile?.publicData?.companyLocation?.address,
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
        isParent: true,
        children: subOrderDates,
        isPaid:
          entity.attributes.metadata.orderState === EOrderStates.completed,
        orderCreatedAt: formatTimestamp(
          new Date(entity.attributes.createdAt!).getTime(),
        ),
        bookerPhoneNumber:
          company?.attributes?.profile?.publicData?.phoneNumber,
        totalDishes,
        orderNotes: entity.attributes.metadata?.notes,
        orderNote: entity.attributes.metadata?.orderNote,
        fullRestaurantsData,
        partnerLocation: allRestaurants.map(
          (_restaurant: any) =>
            _restaurant.attributes?.publicData?.location?.address,
        ),
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
    meta_orderState,
  } = router.query;
  const [sortValue, setSortValue] = useState<TTableSortValue>();
  const [displayedColumns, setDisplayedColumns] = useState<string[]>(
    TABLE_COLUMN.map((column) => column.key),
  );

  const shouldShowTableColums = TABLE_COLUMN.filter((column) => {
    return displayedColumns.includes(column.key);
  });

  const {
    queryOrderInProgress,
    queryOrderError,
    orders = [],
    manageOrdersPagination,
    queryAllOrdersInProgress,
  } = useAppSelector((state) => state.Order, shallowEqual);

  const dataTable = parseEntitiesToTableData(orders);

  const sortedData = sortValue ? sortOrders(sortValue, dataTable) : dataTable;
  const onDownloadOrderList = async (values: TDownloadColumnListFormValues) => {
    const endDateWithOneMoreDay = addDays(new Date(meta_endDate as string), 1);
    const { meta, payload } = await dispatch(
      orderAsyncActions.queryAllOrders({
        keywords,
        meta_orderState,
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
    if (meta.requestStatus === 'fulfilled') {
      const allOrdersData = parseEntitiesToTableData(payload);
      const sortedExportOrdersData = sortValue
        ? sortOrders(sortValue, allOrdersData)
        : allOrdersData;
      makeExcelFile(sortedExportOrdersData, values.downloadColumnListName);
    }
  };

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
          columns={shouldShowTableColums}
          data={sortedData}
          pagination={manageOrdersPagination}
          paginationPath={adminRoutes.ManageOrders.path}
          tableBodyCellClassName={css.bodyCell}
          handleSort={handleSort}
          sortValue={sortValue}
          tableWrapperClassName={css.tableWrapper}
          tableClassName={css.table}
          tableBodyClassName={css.tableBody}
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
    const hasDateFilter = meta_startDate || meta_endDate;
    const metaStartDateQuery = `${
      meta_startDate ? new Date(meta_startDate as string).getTime() : ''
    },${meta_endDate ? new Date(endDateWithOneMoreDay).getTime() : ''}`;
    dispatch(
      orderAsyncActions.queryOrders({
        page,
        keywords,
        ...(meta_orderState ? { meta_orderState } : {}),
        ...(hasDateFilter ? { meta_startDate: metaStartDateQuery } : {}),
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

  const onFilterSubmit = ({
    keywords,
    meta_startDate,
    meta_endDate,
    meta_orderState,
  }: any) => {
    router.push({
      pathname: adminRoutes.ManageOrders.path,
      query: {
        keywords,
        ...(meta_startDate
          ? { meta_startDate: new Date(meta_startDate).toISOString() }
          : {}),
        ...(meta_endDate
          ? { meta_endDate: new Date(meta_endDate).toISOString() }
          : {}),
        ...(meta_orderState ? { meta_orderState } : {}),
      },
    });
  };

  const downloadColumnsListInitialValues: TDownloadColumnListFormValues =
    useMemo(
      () => ({
        downloadColumnListName: [],
      }),
      [],
    );

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
                  onSubmit={onFilterSubmit}
                  initialValues={{
                    meta_state: groupStateString,
                    keywords,
                    meta_orderState,
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
              overlayClassName={css.orderDetailTooltip}
              overlayInnerStyle={{
                backgroundColor: '#fff',
                padding: 0,
              }}>
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
                    onSubmit={(values: TFilterColumnFormValues) =>
                      setDisplayedColumns(values.columnName)
                    }
                    initialValues={{
                      columnName: displayedColumns,
                    }}
                  />
                }
                placement="bottomRight"
                trigger="click"
                overlayClassName={css.orderDetailTooltip}
                overlayInnerStyle={{ backgroundColor: '#fff', padding: 0 }}>
                <Button variant="secondary">Cột</Button>
              </Tooltip>
              <Tooltip
                tooltipContent={
                  <DownloadColumnListForm
                    onSubmit={onDownloadOrderList}
                    initialValues={downloadColumnsListInitialValues}
                    inProgress={queryAllOrdersInProgress}
                  />
                }
                placement="bottomRight"
                trigger="click"
                overlayClassName={css.orderDetailTooltip}
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
