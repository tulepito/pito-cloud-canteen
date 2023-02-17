/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-shadow */
import Badge, { EBadgeType } from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import FieldDatePicker from '@components/FormFields/FieldDatePicker/FieldDatePicker';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconTick from '@components/Icons/IconTick/IconTick';
import IconTruck from '@components/Icons/IconTruck/IconTruck';
import IconWarning from '@components/Icons/IconWarning/IconWarning';
import IntegrationFilterModal from '@components/IntegrationFilterModal/IntegrationFilterModal';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import NamedLink from '@components/NamedLink/NamedLink';
import type { TColumn } from '@components/Table/Table';
import { TableForm } from '@components/Table/Table';
import Tooltip from '@components/Tooltip/Tooltip';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { adminRoutes } from '@src/paths';
import { parseTimestampToFormat } from '@utils/dates';
import {
  EOrderDetailsStatus,
  EOrderStates,
  getLabelByKey,
  ORDER_STATES_OPTIONS,
} from '@utils/enums';
import type {
  TIntegrationListing,
  TIntegrationOrderListing,
} from '@utils/types';
import { parsePrice } from '@utils/validators';
import classNames from 'classnames';
import addDays from 'date-fns/addDays';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { shallowEqual } from 'react-redux';

import css from './ManageOrders.module.scss';

const uniqueStrings = (array: string[]) => {
  return array.filter((item, pos) => {
    return array.indexOf(item) === pos;
  });
};

export const BADGE_TYPE_BASE_ON_ORDER_STATE = {
  [EOrderStates.inProgress]: EBadgeType.PROCESSING,
  [EOrderStates.isNew]: EBadgeType.PROCESSING,
  [EOrderStates.picking]: EBadgeType.WARNING,
  [EOrderStates.reviewed]: EBadgeType.WARNING,
  [EOrderStates.completed]: EBadgeType.WARNING,
  [EOrderStates.canceled]: EBadgeType.DEFAULT,
  [EOrderStates.draft]: EBadgeType.DEFAULT,
};

export const BADGE_CLASSNAME_BASE_ON_ORDER_STATE = {
  [EOrderStates.isNew]: css.badgeProcessing,
  [EOrderStates.inProgress]: css.badgeInProgress,
  [EOrderStates.completed]: css.badgeSuccess,
  [EOrderStates.picking]: css.badgeWarning,
  [EOrderStates.reviewed]: css.badgeWarning,
  [EOrderStates.canceled]: css.badgeDefault,
  [EOrderStates.draft]: css.badgeDefault,
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
        const { foodList = {}, status } = orderDetail[key];
        const totalPrice = Object.keys(foodList).reduce((prev, cur) => {
          const price = foodList[cur].foodPrice;
          return prev + price;
        }, 0);
        const OrderIcon = () => {
          switch (status) {
            case EOrderDetailsStatus.cancelled:
              return (
                <div className={classNames(css.orderIcon, css.cancelledIcon)}>
                  <IconWarning />
                </div>
              );
            case EOrderDetailsStatus.delivered:
              return (
                <div className={classNames(css.orderIcon, css.deliveredIcon)}>
                  <IconTruck />
                </div>
              );
            case EOrderDetailsStatus.received:
              return (
                <div className={classNames(css.orderIcon, css.receivedIcon)}>
                  <IconTick />
                </div>
              );
            default:
              return (
                <div
                  className={classNames(css.orderIcon, css.pendingIcon)}></div>
              );
          }
        };

        return (
          <div key={key} className={css.orderDetailTooltipItem}>
            <OrderIcon />
            <span>
              <span className={css.orderDate}>
                {parseTimestampToFormat(Number(key))}
              </span>
              : {parsePrice(String(totalPrice))}đ
            </span>
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
    render: ({ id, title, subOrders }: any) => {
      return (
        <NamedLink path={`${adminRoutes.ManageOrders.path}/${id}`}>
          {subOrders.length > 0 ? (
            <Tooltip
              overlayClassName={css.orderDetailTooltip}
              overlayInnerStyle={{ backgroundColor: '#ffffff' }}
              showArrow={false}
              tooltipContent={<OrderDetailTooltip subOrders={subOrders} />}
              placement="bottomLeft">
              <div className={css.boldText}>#{title}</div>
            </Tooltip>
          ) : (
            <div className={css.boldText}>#{title}</div>
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
    label: 'Nguời đại diện',
    render: (data: any) => {
      return <div>{data.bookerName}</div>;
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
            <div key={restaurantName}>{restaurantName}</div>
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
    }: {
      state: Exclude<EOrderStates, EOrderStates.draft>;
    }) => {
      return (
        <Badge
          containerClassName={classNames(
            css.badge,
            BADGE_CLASSNAME_BASE_ON_ORDER_STATE[state],
          )}
          labelClassName={css.badgeLabel}
          type={BADGE_TYPE_BASE_ON_ORDER_STATE[state] || EBadgeType.DEFAULT}
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
          type={isPaid ? EBadgeType.SUCCESS : EBadgeType.WARNING}
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
    const { company, subOrders = [], booker } = entity;
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
        companyName: company?.attributes.profile.displayName,
        bookerName: booker?.attributes.profile.displayName,
        startDate: startDate && parseTimestampToFormat(startDate),
        endDate: endDate && parseTimestampToFormat(endDate),
        staffName,
        state: orderState || EOrderStates.isNew,
        orderId: entity?.id?.uuid,
        restaurants,
        subOrders,
        orderName: entity.attributes.publicData.orderName,
        deliveryHour,
      },
    };
  });
};

type TSortValue = {
  columnName: string | number;
  type: 'asc' | 'desc';
};

const sortOrders = ({ columnName, type }: TSortValue, data: any) => {
  const isAsc = type === 'asc';
  // eslint-disable-next-line array-callback-return
  return data.sort((a: any, b: any) => {
    if (typeof a.data[columnName] === 'number') {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      isAsc
        ? b.data[columnName] - a.data[columnName]
        : a.data[columnName] - b.data[columnName];
    } else if (typeof a.data[columnName] === 'string') {
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
  const [sortValue, setSortValue] = useState<TSortValue>();
  const {
    queryOrderInProgress,
    queryOrderError,
    orders = [],
    manageOrdersPagination,
  } = useAppSelector((state) => state.Order, shallowEqual);

  const dataTable = parseEntitiesToTableData(orders, Number(page));

  const sortedData = sortValue ? sortOrders(sortValue, dataTable) : dataTable;

  const handleSort = (columnName: string | number) => {
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
          onSubmit={onSubmit}>
          {({ values, form }: any) => {
            const setStartDate = (date: Date) => {
              form.change('meta_startDate', date);
              if (values.meta_endDate) {
                form.change('meta_endDate', undefined);
              }
            };
            const setEndDate = (date: Date) => {
              form.change('meta_endDate', date);
            };

            const minEndDate = addDays(values.meta_startDate, 1);

            return (
              <>
                <FieldTextInput
                  name="keywords"
                  id="keywords"
                  label="Mã đơn"
                  placeholder="Nhập mã đơn"
                  className={css.input}
                />

                <label className={css.labelDate}>
                  <FormattedMessage id="ManageOrderPage.createDateLabel" />
                </label>
                <div className={css.dateInputs}>
                  <FieldDatePicker
                    id="meta_startDate"
                    name="meta_startDate"
                    selected={values.meta_startDate}
                    onChange={setStartDate}
                    dateFormat={'dd MMMM, yyyy'}
                    placeholderText={'Nhập ngày bắt đầu'}
                    autoComplete="off"
                  />
                  <FieldDatePicker
                    id="meta_endDate"
                    name="meta_endDate"
                    onChange={setEndDate}
                    selected={values.meta_endDate}
                    dateFormat={'dd MMMM, yyyy'}
                    placeholderText={'Nhập ngày kết thúc'}
                    autoComplete="off"
                    minDate={minEndDate}
                    disabled={!values.meta_startDate}
                  />
                </div>
              </>
            );
          }}
        </IntegrationFilterModal>
      </div>
      {content}
    </div>
  );
};

export default ManageOrdersPage;
