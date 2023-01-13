/* eslint-disable @typescript-eslint/no-shadow */
import Badge, { BadgeType } from '@components/Badge/Badge';
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
import { parseTimestaimpToFormat } from '@utils/dates';
import {
  EOrderStates,
  getLabelByKey,
  ORDER_STATES_OPTIONS,
} from '@utils/enums';
import type {
  TIntergrationOrderListing,
  TReverseMapFromEnum,
} from '@utils/types';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { shallowEqual } from 'react-redux';

import css from './ManageOrders.module.scss';

const ORDER_STATE_BAGDE_TYPE: Record<
  TReverseMapFromEnum<typeof EOrderStates>,
  | typeof BadgeType.PROCESSING
  | typeof BadgeType.DEFAULT
  | typeof BadgeType.SUCCESS
  | typeof BadgeType.WARNING
> = {
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
    label: 'Đơn hàng',
    render: (data: any) => {
      return (
        <NamedLink path={`${adminRoutes.ManageOrders.path}/${data.id}`}>
          <div className={css.boldText}>#{data.title}</div>
        </NamedLink>
      );
    },
  },
  {
    key: 'orderName',
    label: 'Tên đơn hàng',
    render: ({ title }: any) => {
      return <div>Pito Cloud Canteen - #{title}</div>;
    },
  },
  {
    key: 'address',
    label: 'Địa điểm giao hàng',
    render: (data: any) => {
      return <div>{data.location}</div>;
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
    key: 'dates',
    label: 'Thời gian',
    render: (data: any) => {
      return (
        <div className={css.rowText}>
          {data.startDate} - {data.endDate}
        </div>
      );
    },
  },
  {
    key: 'dates',
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
          type={ORDER_STATE_BAGDE_TYPE[state] || BadgeType.DEFAULT}
          label={getLabelByKey(ORDER_STATES_OPTIONS, state)}
        />
      );
    },
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
        state: entity.attributes.metadata?.state || EOrderStates.inProgress,
        orderId: entity?.id?.uuid,
        restaurants: Object.keys(orderDetail).map((key) => {
          return orderDetail[key]?.restaurant?.restaurantName;
        }),
      },
    };
  });
};

const ManageOrdersPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { page = 1, keywords = '', meta_state = '' } = router.query;
  const {
    queryOrderInProgress,
    queryOrderError,
    orders = [],
    manageOrdersPagination,
  } = useAppSelector((state) => state.Order, shallowEqual);

  const dataTable = parseEntitiesToTableData(orders, Number(page));

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
          data={dataTable}
          pagination={manageOrdersPagination}
          paginationPath={adminRoutes.ManageOrders.path}
          tableBodyCellClassName={css.bodyCell}
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
      </div>
      {content}
    </div>
  );
};

export default ManageOrdersPage;
