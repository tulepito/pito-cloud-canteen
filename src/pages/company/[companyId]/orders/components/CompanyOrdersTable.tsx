/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import { TableForm } from '@components/Table/Table';
import type { TTabsItem } from '@components/Tabs/Tabs';
import Tabs from '@components/Tabs/Tabs';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { createDeepEqualSelector } from '@redux/redux.helper';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import type { RootState } from '@redux/store';
import { companyPaths } from '@src/paths';
import { historyPushState } from '@src/utils/history';
import {
  EManageCompanyOrdersTab,
  EOrderStates,
  MANAGE_COMPANY_ORDERS_TAB_MAP,
} from '@utils/enums';
import type { TObject } from '@utils/types';

import { parseEntitiesToTableData } from '../helpers/parseEntitiesToTableData';

import OrderStateWarningModal from './OrderStateWarningModal/OrderStateWarningModal';
import { CompanyOrdersTableColumns } from './CompanyOrdersTableColumns';
import type { TSearchOrderFormValues } from './SearchOrderForm';
import SearchOrderForm from './SearchOrderForm';

import css from './CompanyOrdersTable.module.scss';

const DEBOUNCE_TIME = 300;

const tabLabelMap = {
  [EManageCompanyOrdersTab.SCHEDULED]:
    'ManageCompanyOrdersPage.tabSection.scheduledLabel',
  [EManageCompanyOrdersTab.COMPLETED]:
    'ManageCompanyOrdersPage.tabSection.completedLabel',
  [EManageCompanyOrdersTab.DRAFT]:
    'ManageCompanyOrdersPage.tabSection.draftLabel',
  [EManageCompanyOrdersTab.CANCELED]:
    'ManageCompanyOrdersPage.tabSection.canceledLabel',
  [EManageCompanyOrdersTab.ALL]: 'ManageCompanyOrdersPage.tabSection.allLabel',
};

const findTabIndexById = (tabId: EManageCompanyOrdersTab) => {
  switch (tabId) {
    case EManageCompanyOrdersTab.SCHEDULED:
      return 1;
    case EManageCompanyOrdersTab.COMPLETED:
      return 2;
    case EManageCompanyOrdersTab.DRAFT:
      return 3;
    case EManageCompanyOrdersTab.CANCELED:
      return 4;
    case EManageCompanyOrdersTab.ALL:
      return 5;
    default:
      return 5;
  }
};

const statesSelector = createDeepEqualSelector(
  (state: RootState) => state.Order,
  ({
    queryOrderError,
    queryOrderInProgress,
    orders = [],
    manageOrdersPagination,
    totalItemMap = {},
  }) => ({
    queryOrderError,
    queryOrderInProgress,
    orders,
    manageOrdersPagination,
    totalItemMap,
  }),
);

const prepareTabItems = ({ intl, currentTab, tableData }: any) => {
  const {
    queryOrderError,
    queryOrderInProgress,
    orders,
    manageOrdersPagination,
    totalItemMap,
  } = useAppSelector(statesSelector);

  return Object.entries(tabLabelMap).map(([key, id]) => {
    const isTabActive = currentTab === key;

    const countClasses = classNames(css.count, {
      [css.countActive]: isTabActive,
    });

    const label = (
      <div className={css.tabLabel}>
        {intl.formatMessage({ id })}
        <span className={countClasses}>{(totalItemMap as TObject)[key]}</span>
      </div>
    );

    let content;
    if (queryOrderInProgress) {
      content = <LoadingContainer />;
    } else if (queryOrderError) {
      content = <ErrorMessage message={queryOrderError.message} />;
    } else if (orders.length > 0) {
      content = (
        <TableForm
          columns={CompanyOrdersTableColumns}
          data={tableData}
          paginationLinksClassName={css.pagination}
          pagination={manageOrdersPagination}
          paginationPath={companyPaths.ManageOrders}
          tableBodyCellClassName={css.bodyCell}
        />
      );
    } else {
      content = (
        <p>
          <FormattedMessage id="ManageOrders.noResults" />
        </p>
      );
    }

    return {
      id: key,
      label,
      children: <div className={css.manageOrdersContainer}>{content}</div>,
    };
  });
};

type TCompanyOrdersTableProps = {};

const CompanyOrdersTable: React.FC<TCompanyOrdersTableProps> = () => {
  const intl = useIntl();
  const router = useRouter();

  const { query, isReady, replace } = useRouter();
  const dispatch = useAppDispatch();
  const orders = useAppSelector((state) => state.Order.orders) || [];
  const queryOrderInProgress = useAppSelector(
    (state) => state.Order.queryOrderInProgress,
  );
  const { totalPages = 1 } = useAppSelector(
    (state) => state.Order.manageOrdersPagination,
  );

  const currentOrderVATPercentage = useAppSelector(
    (state) => state.SystemAttributes.currentOrderVATPercentage,
  );
  const updateOrderStateToDraftInProgress = useAppSelector(
    (state) => state.Order.updateOrderStateToDraftInProgress,
  );
  const bookerDeleteOrderInProgress = useAppSelector(
    (state) => state.Order.bookerDeleteOrderInProgress,
  );

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const [orderWarningState, setOrderWarningState] = useState<
    EOrderStates | 'expireStartOrder' | null
  >();

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  let currDebounceRef = debounceRef.current;

  const {
    page = 1,
    keywords = '',
    companyId = '',
    currentTab = EManageCompanyOrdersTab.ALL,
  } = query;

  const openOrderStateWarningModal = (value: EOrderStates) => {
    setOrderWarningState(value);
  };

  const onCancelOrderStateWarningModal = async () => {
    if (orderWarningState === EOrderStates.expiredStart) {
      console.log('aleleh: ', selectedOrderId, companyId);

      await dispatch(
        orderAsyncActions.bookerDeleteOrder({
          orderId: selectedOrderId,
          companyId,
        }),
      );

      setOrderWarningState(null);
    }
  };

  const closeOrderStateWarningModal = async () => {
    setOrderWarningState(null);
  };

  const onConfirmOrderStateWarningModal = async () => {
    if (orderWarningState === 'expireStartOrder') {
      await dispatch(
        orderAsyncActions.updateOrderStateToDraft(selectedOrderId!),
      );

      return router.push({
        pathname: companyPaths.EditDraftOrder,
        query: { orderId: selectedOrderId },
      });
    }

    return router.push(companyPaths.CreateNewOrder);
  };

  const orderStateWarningContent =
    orderWarningState === EOrderStates.expiredStart
      ? 'Đơn hàng đã hết hiệu lực đặt.'
      : orderWarningState === 'expireStartOrder'
      ? 'Đơn hàng đã quá hạn đặt. Chọn lại ngày giao hàng nhé.'
      : 'Đơn hàng của bạn đã huỷ. Bạn có muốn đặt đơn mới không?';

  const orderStateWarningModalTitle =
    orderWarningState === EOrderStates.expiredStart
      ? 'Đơn Hàng Đã Hết Hiệu Lực'
      : orderWarningState === 'expireStartOrder'
      ? 'Đơn Hàng Đã Quá Hạn đặt'
      : 'Đơn Hàng Đã Hủy';

  const orderStateWarningModalConfirmText =
    orderWarningState === 'expireStartOrder' ? 'Tiếp tục' : 'Đặt Đơn Mới';
  const tableData = parseEntitiesToTableData(
    orders,
    Number(page),
    currentOrderVATPercentage,
    openOrderStateWarningModal,
    setSelectedOrderId,
  );

  const tabItems = prepareTabItems({
    intl,
    currentTab,
    tableData,
  });

  const handleTabChange = ({ id: newTab }: TTabsItem) => {
    let newQuery = {};

    if (newTab.toString() !== currentTab.toString()) {
      newQuery = { companyId: companyId as string, currentTab: newTab };
    } else {
      newQuery = { ...router.query, currentTab: newTab.toString() };
    }

    router.push({
      pathname: router.pathname,
      query: newQuery,
    });
  };

  const handleSubmitSearch = ({
    keywords: keywordsFormForm,
  }: TSearchOrderFormValues) => {
    if (keywordsFormForm === keywords) {
      return;
    }

    if (currDebounceRef) {
      clearTimeout(currDebounceRef);
    }

    currDebounceRef = setTimeout(() => {
      replace({ query: { ...query, keywords: keywordsFormForm } }, undefined, {
        shallow: true,
      });
    }, DEBOUNCE_TIME);
  };

  useEffect(() => {
    if (Number(page) > totalPages && totalPages > 0) {
      historyPushState('page', totalPages.toString());
    }
  }, [page, totalPages]);

  useEffect(() => {
    if (!currentTab || !isReady || !companyId || companyId === '[companyId]')
      return;

    let params: TObject = {
      page,
      keywords,
      companyId,
    };

    const parsedOrderState =
      MANAGE_COMPANY_ORDERS_TAB_MAP[
        currentTab as keyof typeof MANAGE_COMPANY_ORDERS_TAB_MAP
      ].join(',');

    params = {
      ...params,
      meta_orderState: parsedOrderState,
      currentTab,
    };
    dispatch(orderAsyncActions.queryCompanyOrders(params));
  }, [companyId, currentTab, dispatch, isReady, keywords, page]);

  const currentTabIndex = findTabIndexById(
    currentTab as EManageCompanyOrdersTab,
  );

  return (
    <div className={css.root}>
      <Tabs
        disabled={queryOrderInProgress}
        items={tabItems}
        onChange={handleTabChange}
        defaultActiveKey={String(currentTabIndex) as string}
        className={css.tabContainer}
        headerClassName={css.tabHeader}
        headerWrapperClassName={css.headerWrapper}
        actionsClassName={css.searchForm}
        actionsComponent={
          <SearchOrderForm
            onSubmit={handleSubmitSearch}
            initialValues={{ keywords: keywords as string }}
          />
        }
      />
      <OrderStateWarningModal
        id="CompanyOrdersTable.OrderStateWarningModal"
        title={orderStateWarningModalTitle}
        isOpen={!!orderWarningState}
        handleClose={closeOrderStateWarningModal}
        onCancel={onCancelOrderStateWarningModal}
        onConfirm={onConfirmOrderStateWarningModal}
        content={orderStateWarningContent}
        confirmText={orderStateWarningModalConfirmText}
        confirmInProgress={updateOrderStateToDraftInProgress}
        cancelText={
          orderWarningState === EOrderStates.expiredStart ? 'Xóa đơn' : 'Thoát'
        }
        cancelInProgress={bookerDeleteOrderInProgress}
      />
    </div>
  );
};

export default CompanyOrdersTable;
