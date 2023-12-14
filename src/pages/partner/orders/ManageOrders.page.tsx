/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-shadow */
import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { isEmpty } from 'lodash';
import { DateTime } from 'luxon';
import { useRouter } from 'next/router';

import Badge, { EBadgeType } from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import IconFilter from '@components/Icons/IconFilter/IconFilter';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import NamedLink from '@components/NamedLink/NamedLink';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import SlideModal from '@components/SlideModal/SlideModal';
import SubOrderBadge from '@components/SubOrderBadge/SubOrderBadge';
import type { TColumn } from '@components/Table/Table';
import { TableForm } from '@components/Table/Table';
import Tooltip from '@components/Tooltip/Tooltip';
import { convertHHmmStringToTimeParts } from '@helpers/dateHelpers';
import { parseThousandNumber } from '@helpers/format';
import { calculatePriceQuotationPartner } from '@helpers/order/cartInfoHelper';
import { ensureVATSetting } from '@helpers/order/prepareDataHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { useViewport } from '@hooks/useViewport';
import EmptySubOrder from '@pages/participant/orders/components/EmptySubOrder/EmptySubOrder';
import { currentUserSelector } from '@redux/slices/user.slice';
import { partnerPaths } from '@src/paths';
import { CurrentUser } from '@src/utils/data';
import { formatTimestamp } from '@src/utils/dates';
import { ETransition } from '@src/utils/transaction';
import { EOrderDraftStates } from '@utils/enums';
import type { TObject, TTableSortValue } from '@utils/types';

import type { TFilterPartnerOrderFormValues } from './components/FilterPartnerOrderForm';
import FilterPartnerOrderForm from './components/FilterPartnerOrderForm';
import PartnerSubOrderCard from './components/PartnerSubOrderCard/PartnerSubOrderCard';
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
      const { date, deliveryHour } = data;

      return date ? (
        <div className={css.rowText}>
          <div className={css.deliveryHour}>{deliveryHour}</div>
          {formatTimestamp(Number(date))}
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
    render: ({ lastTransition }: TObject) => {
      return <SubOrderBadge lastTransition={lastTransition} />;
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
          type={isPaid ? EBadgeType.success : EBadgeType.warning}
          label={isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
        />
      );
    },
  },
];

const parseEntitiesToTableData = (
  subOrders: TObject[],
  _restaurantId: string,
) => {
  return subOrders.map((entity) => {
    const {
      orderId,
      date,
      companyName,
      orderTitle,
      staffName,
      startDate,
      endDate,
      deliveryHour = '',
      restaurant = {},
      lastTransition,
      isPaid,
      quotation,
      serviceFees = {},
      orderVATPercentage,
      vatSettings = {},
    } = entity;
    const dayIndex = new Date(Number(date)).getDay();
    const { id: restaurantId } = restaurant;

    let totalPrice = 0;
    if (!isEmpty(quotation)) {
      if (!isEmpty(quotation[restaurant.id]?.quotation)) {
        const vatSettingFromOrder = vatSettings[restaurant?.id];

        const partnerQuotationBySubOrderDate = calculatePriceQuotationPartner({
          quotation: quotation[restaurant.id].quotation,
          serviceFeePercentage: serviceFees[restaurant.id],
          orderVATPercentage,
          subOrderDate: date,
          vatSetting: ensureVATSetting(vatSettingFromOrder),
        });

        const { totalWithVAT } = partnerQuotationBySubOrderDate;
        totalPrice = totalWithVAT;
      }
    }

    const subOrderTitle = `${orderTitle}-${dayIndex > 0 ? dayIndex : 7}`;

    return {
      key: subOrderTitle,
      data: {
        id: orderId,
        date,
        subOrderTitle,
        totalPrice: `${parseThousandNumber(totalPrice) || 0}đ`,
        companyName,
        orderName: `${companyName}_${formatTimestamp(date)}`,
        staffName,
        startDate: startDate ? formatTimestamp(startDate) : '',
        time: DateTime.fromMillis(Number(date || 0))
          .startOf('day')
          .plus({
            ...convertHHmmStringToTimeParts(
              isEmpty(deliveryHour)
                ? undefined
                : deliveryHour.includes('-')
                ? deliveryHour.split('-')[0]
                : deliveryHour,
            ),
          })
          .toMillis(),
        endDate: endDate ? formatTimestamp(endDate) : '',
        state: EOrderDraftStates.pendingApproval,
        deliveryHour,
        lastTransition:
          _restaurantId !== restaurantId
            ? ETransition.OPERATOR_CANCEL_PLAN
            : lastTransition,
        isPaid,
      },
    };
  });
};

const sortOrders = ({ columnName, type }: TTableSortValue, data: any) => {
  const isAsc = type === 'asc';

  // eslint-disable-next-line array-callback-return
  return data.sort((a: any, b: any) => {
    if (columnName === 'time') {
      return isAsc ? a.data.time - b.data.time : b.data.time - a.data.time;
    }
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
  const { isMobileLayout } = useViewport();
  const filterPartnerSubOrderModalController = useBoolean();
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
  const currentUser = useAppSelector(currentUserSelector);
  const currentUserGetter = CurrentUser(currentUser);
  const { restaurantListingId } = currentUserGetter.getMetadata();
  const dataTable = parseEntitiesToTableData(
    currentSubOrders,
    restaurantListingId,
  );

  const sortedData = sortValue ? sortOrders(sortValue, dataTable) : dataTable;

  const initialFilterFormValues = useMemo(
    () => ({
      subOrderName: name as string,
      subOrderId: subOrderId as string,
      subOrderStartTime: Number(startTime || 0),
      subOrderEndTime: Number(endTime || 0),
      subOrderStatus: ((status as string) || '').split(','),
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
        <div className={css.mobileContentWrapper}>
          {sortedData.map((item: TObject) => (
            <PartnerSubOrderCard key={item.key} data={item.data} />
          ))}
        </div>
        <div className={css.desktopContentWrapper}>
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
        </div>
      </>
    );
  } else {
    content = (
      <div className={css.emptyWrapper}>
        <EmptySubOrder />
      </div>
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
        ...(status ? { status: status.join(',') } : {}),
        ...(subOrderId ? { subOrderId } : {}),
      },
    });
  };

  const handleClearFilter = () => {
    router.replace({
      pathname: partnerPaths.ManageOrders,
      query: {},
    });
  };

  useEffect(() => {
    if (isReady && !isFirstLoad) {
      dispatch(
        PartnerManageOrdersActions.filterData({
          page: Number(page),
          ...(name ? { name } : {}),
          ...(startTime ? { startTime } : {}),
          ...(endTime ? { endTime } : {}),
          ...(status ? { status } : {}),
          ...(subOrderId ? { subOrderId } : {}),
          isMobile: isMobileLayout,
        }),
      );
    }
  }, [
    isReady,
    page,
    name,
    subOrderId,
    startTime,
    endTime,
    status,
    isMobileLayout,
    isFirstLoad,
  ]);

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
            isMobile: isMobileLayout,
          }),
        );
      });
    }

    return () => {
      dispatch(PartnerManageOrdersActions.resetStates());
    };
  }, []);

  return (
    <div className={css.root}>
      <div className={css.pageHeader}>
        <h1 className={css.title}>
          <FormattedMessage id="ManageOrders.title" />
        </h1>
        <Button
          variant="secondary"
          className={css.mobileFilterBtn}
          onClick={filterPartnerSubOrderModalController.setTrue}>
          <div className={css.filterIconContainer}>
            <IconFilter className={css.filterIcon} />
          </div>
        </Button>
      </div>

      <Tooltip
        overlayClassName={css.filterBtnTooltipOverlay}
        tooltipContent={
          <FilterPartnerOrderForm
            initialValues={initialFilterFormValues}
            onSubmit={handleFilterChange}
            onClearFilter={handleClearFilter}
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

      <RenderWhen condition={isMobileLayout}>
        <SlideModal
          id="FilterPartnerSubOrderModal"
          isOpen={filterPartnerSubOrderModalController.value}
          onClose={filterPartnerSubOrderModalController.setFalse}>
          <FilterPartnerOrderForm
            initialValues={initialFilterFormValues}
            onSubmit={handleFilterChange}
            onClearFilter={handleClearFilter}
          />
        </SlideModal>
      </RenderWhen>
    </div>
  );
};

export default ManageOrdersPage;
