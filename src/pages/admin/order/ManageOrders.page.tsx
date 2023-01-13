/* eslint-disable @typescript-eslint/no-shadow */
import Badge, { BadgeType } from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import FieldMultipleSelect from '@components/FieldMutipleSelect/FieldMultipleSelect';
import FieldTextInput from '@components/FieldTextInput/FieldTextInput';
import IntegrationFilterModal from '@components/IntegrationFilterModal/IntegrationFilterModal';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import NamedLink from '@components/NamedLink/NamedLink';
import type { TColumn } from '@components/Table/Table';
import { TableForm } from '@components/Table/Table';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { OrderAsyncAction } from '@redux/slices/Order.slice';
import { adminRoutes } from '@src/paths';
import {
  EOrderStates,
  getLabelByKey,
  ORDER_STATES_OPTIONS,
} from '@utils/enums';
import type {
  TIntergrationOrderListing,
  TReverseMapFromEnum,
} from '@utils/types';
import { DateTime } from 'luxon';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { shallowEqual } from 'react-redux';

import css from './ManageOrders.module.scss';

const parseTimestaimpToFormat = (date: number) => {
  return DateTime.fromMillis(date).toFormat('dd/MM/yyyy');
};

const uniqueStrings = (array: string[]) => {
  return array.filter((item, pos) => {
    return array.indexOf(item) === pos;
  });
};

const ORDER_STATE_BAGDE_TYPE = {
  [EOrderStates.inProgress]: BadgeType.PROCESSING,
  [EOrderStates.isNew]: BadgeType.PROCESSING,
  [EOrderStates.cancel]: BadgeType.DEFAULT,
  [EOrderStates.delivery]: BadgeType.SUCCESS,
  [EOrderStates.completed]: BadgeType.SUCCESS,
  [EOrderStates.pendingPayment]: BadgeType.WARNING,
  [EOrderStates.picking]: BadgeType.WARNING,
};

const TABLE_COLUMN: TColumn[] = [
  {
    key: 'title',
    label: 'ID',
    render: (data: any) => {
      return (
        <NamedLink path={`${adminRoutes.ManageOrders.path}/${data.id}`}>
          <div className={css.boldText}>#{data.title}</div>
        </NamedLink>
      );
    },
    sortable: true,
  },
  {
    key: 'orderName',
    label: 'Tên đơn hàng',
    render: ({ companyName, startDate, endDate }: any) => {
      return (
        <div className={css.orderName}>
          {companyName}_PCC_{startDate} - {endDate}
        </div>
      );
    },
  },
  {
    key: 'address',
    label: 'Địa điểm giao hàng',
    render: (data: any) => {
      return <div className={css.locationRow}>{data.location}</div>;
    },
  },
  {
    key: 'companyName',
    label: 'Khách hàng',
    render: (data: any) => {
      return <div>{data.companyName}</div>;
    },
  },
  {
    key: 'startDate',
    label: 'Thời gian',
    render: (data: any) => {
      return (
        <div className={css.rowText}>
          {data.startDate} - {data.endDate}
        </div>
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
      return (
        <div className={css.rowText}>
          {restaurants.slice(0, 2).map((restaurantName: string) => (
            <div key={restaurantName}>{restaurantName}</div>
          ))}
          {moreThanTwo && (
            <div className={css.remainText}>+ {remainLength} đối tác </div>
          )}
        </div>
      );
    },
  },
  {
    key: 'staffName',
    label: 'Nhân viên phụ trách',
    render: (data: any) => {
      return <div>{data.staffName}</div>;
    },
    sortable: true,
  },
  {
    key: 'shipperName',
    label: 'Nhân viên giao hàng',
    render: (data: any) => {
      return <div>{data.shipperName}</div>;
    },
    sortable: true,
  },
  {
    key: 'state',
    label: 'Trạng thái',
    render: ({
      state,
    }: {
      state: TReverseMapFromEnum<typeof EOrderStates>;
    }) => {
      return (
        <Badge
          containerClassName={css.badge}
          labelClassName={css.badgeLabel}
          type={(ORDER_STATE_BAGDE_TYPE[state] as any) || BadgeType.DEFAULT}
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
          type={isPaid ? 'success' : 'warning'}
          label={isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
        />
      );
    },
  },
];

const parseEntitiesToTableData = (
  orders: TIntergrationOrderListing[],
  page: number,
) => {
  if (orders.length === 0) return [];
  return orders.map((entity, index) => {
    const { company } = entity;
    const { orderDetail = {} } = entity?.attributes?.metadata || {};
    return {
      key: entity.id.uuid,
      data: {
        id: entity.id.uuid,
        title: entity.attributes.title,
        orderNumber: (page - 1) * 10 + index + 1,
        location:
          entity?.attributes?.metadata?.generalInfo?.deliveryAddress?.address,
        companyName: company?.attributes.profile.displayName,
        startDate: parseTimestaimpToFormat(
          entity?.attributes?.metadata?.generalInfo?.startDate,
        ),
        endDate: parseTimestaimpToFormat(
          entity?.attributes?.metadata?.generalInfo?.endDate,
        ),
        staffName: entity?.attributes?.metadata?.generalInfo?.staffName,
        state: entity.attributes.metadata?.orderState || EOrderStates.isNew,
        orderId: entity?.id?.uuid,
        restaurants: uniqueStrings(
          Object.keys(orderDetail).map((key) => {
            return orderDetail[key]?.restaurant?.restaurantName;
          }),
        ),
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
  const { page = 1, keywords = '', meta_state = '' } = router.query;
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
    dispatch(OrderAsyncAction.queryOrders({ page, keywords }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const onClearFilter = () => {
    router.push({
      pathname: adminRoutes.ManageOrders.path,
      query: {},
    });
  };

  const onSubmit = ({ keywords, meta_state }: any) => {
    router.push({
      pathname: adminRoutes.ManageOrders.path,
      query: {
        keywords,
        meta_state: meta_state.join(','),
      },
    });
  };

  return (
    <div className={css.root}>
      <h1 className={css.title}>
        <FormattedMessage id="ManageOrders.title" />
      </h1>
      <div className={css.filterForm}>
        <IntegrationFilterModal
          onClear={onClearFilter}
          initialValues={{ meta_state: groupStateString, keywords }}
          onSubmit={onSubmit}>
          <FieldTextInput
            name="keywords"
            id="keywords"
            label="Mã đơn"
            placeholder="Nhập mã đơn"
            className={css.input}
          />
          <FieldMultipleSelect
            className={css.input}
            name="meta_state"
            id="meta_state"
            label="Trạng thái"
            placeholder="Chọn trạng thái"
            options={ORDER_STATES_OPTIONS}
          />
        </IntegrationFilterModal>
        <NamedLink path={adminRoutes.CreateOrder.path}>
          <Button>Tạo đơn</Button>
        </NamedLink>
      </div>
      {content}
    </div>
  );
};

export default ManageOrdersPage;
