import { InlineTextButton } from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import NamedLink from '@components/NamedLink/NamedLink';
import type { TColumn } from '@components/Table/Table';
import { TableForm } from '@components/Table/Table';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { OrderAsyncAction } from '@redux/slices/Order.slice';
import { adminRoutes } from '@src/paths';
import { EOrderStates } from '@utils/enums';
import type { TIntergrationOrderListing } from '@utils/types';
import { DateTime } from 'luxon';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { shallowEqual } from 'react-redux';

import css from './ManageOrders.module.scss';

const parseTimestaimpToFormat = (date: number) => {
  return DateTime.fromMillis(date).toFormat('dd-MM-yyyy');
};

const TABLE_COLUMN: TColumn[] = [
  {
    key: 'orderNumber',
    label: 'STT',
    render: (data: any) => {
      return <p>{data.orderNumber}</p>;
    },
  },
  {
    key: 'title',
    label: 'Mã đơn',
    render: (data: any) => {
      return (
        <NamedLink path={`${adminRoutes.ManageOrders.path}/${data.id}`}>
          <p>{data.title}</p>
        </NamedLink>
      );
    },
  },
  {
    key: 'companyName',
    label: 'Khách hàng',
    render: (data: any) => {
      return <span>{data.companyName}</span>;
    },
  },
  {
    key: 'staffName',
    label: 'Tên nhân viên',
    render: (data: any) => {
      return <span>{data.staffName}</span>;
    },
  },
  {
    key: 'address',
    label: 'Địa chỉ',
    render: (data: any) => {
      return <span className={css.rowText}>{data.location}</span>;
    },
  },
  {
    key: 'state',
    label: 'Trạng thái',
    render: (data: any) => {
      return <span className={css.rowText}>{data.state}</span>;
    },
  },
  {
    key: 'action',
    label: '',
    render: () => {
      return <InlineTextButton type="button">Tạo đơn</InlineTextButton>;
    },
  },
];

const parseEntitiesToTableData = (
  orders: TIntergrationOrderListing[],
  page: number,
) => {
  if (orders.length === 0) return [];
  return orders.map((entity, index) => ({
    key: entity.id.uuid,
    data: {
      id: entity.id.uuid,
      title: entity.attributes.title,
      orderNumber: (page - 1) * 10 + index + 1,
      name: entity.attributes.title,
      location:
        entity.attributes.metadata?.generalInfo?.deliveryAddress?.address,
      companyName: entity.company?.attributes.profile.displayName,
      startDate: parseTimestaimpToFormat(
        entity.attributes.metadata?.generalInfo?.startDate,
      ),
      staffName: entity.attributes.metadata?.generalInfo?.staffName,
      state: entity.attributes.metadata?.state || EOrderStates.draft,
    },
  }));
};

const ManageOrdersPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { page = 1 } = router.query;
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
          paginationPath="/admin/order"
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

  useEffect(() => {
    dispatch(OrderAsyncAction.queryOrders({ page }));
  }, [dispatch]);

  return (
    <div className={css.root}>
      <h1 className={css.title}>
        <FormattedMessage id="ManageOrders.title" />
      </h1>
      {content}
    </div>
  );
};

export default ManageOrdersPage;
