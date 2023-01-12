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
import { EOrderStates, ORDER_STATES_OPTIONS } from '@utils/enums';
import type { TIntergrationOrderListing } from '@utils/types';
import { DateTime } from 'luxon';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { shallowEqual } from 'react-redux';

import type { TKeywordSearchFormValues } from '../partner/components/KeywordSearchForm/KeywordSearchForm';
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
      return (
        <div className={css.rowState}>
          <span>
            <FormattedMessage id={`ManageOrdersPage.${data.state}State`} />
          </span>
        </div>
      );
    },
  },
  {
    key: 'action',
    label: '',
    render: (data: any) => {
      return (
        <NamedLink path={`${adminRoutes.ManageOrders.path}/${data.id}`}>
          <FormattedMessage id="ManageOrdersPage.orderDetails" />
        </NamedLink>
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
        staffName: entity?.attributes?.metadata?.generalInfo?.staffName,
        state: entity.attributes.metadata?.state || EOrderStates.inProgress,
        orderId: entity?.id?.uuid,
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

  const onSubmit = (values: TKeywordSearchFormValues) => {
    router.push({
      pathname: adminRoutes.ManageOrders.path,
      query: {
        ...values,
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
