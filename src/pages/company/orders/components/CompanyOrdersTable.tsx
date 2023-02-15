/* eslint-disable react-hooks/rules-of-hooks */
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import { TableForm } from '@components/Table/Table';
import type { TTabsItem } from '@components/Tabs/Tabs';
import Tabs from '@components/Tabs/Tabs';
import { getCompanyIdFromBookerUser } from '@helpers/company';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { createDeepEqualSelector } from '@redux/redux.helper';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { currentUserSelector } from '@redux/slices/user.slice';
import type { RootState } from '@redux/store';
import { companyPaths } from '@src/paths';
import {
  EManageCompanyOrdersTab,
  MANAGE_COMPANY_ORDERS_TAB_MAP,
} from '@utils/enums';
import type { TObject } from '@utils/types';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { parseEntitiesToTableData } from '../helpers/parseEntitiesToTableData';
import css from './CompanyOrdersTable.module.scss';
import { CompanyOrdersTableColumns } from './CompanyOrdersTableColumns';
import type { TSearchOrderFormValues } from './SearchOrderForm';
import SearchOrderForm from './SearchOrderForm';

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
  const [currentTab, setCurrentTab] = useState<EManageCompanyOrdersTab>(
    EManageCompanyOrdersTab.ALL,
  );
  const { query, isReady, replace } = useRouter();
  const dispatch = useAppDispatch();
  const orders = useAppSelector((state) => state.Order.orders) || [];
  const currentUser = useAppSelector(currentUserSelector);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  let currDebounceRef = debounceRef.current;

  const { page = 1, keywords = '' } = query;
  const companyId = getCompanyIdFromBookerUser(currentUser);
  const tableData = parseEntitiesToTableData(orders, Number(page));
  const tabItems = prepareTabItems({
    intl,
    currentTab,
    tableData,
  });

  const handleTabChange = ({ id }: TTabsItem) => {
    setCurrentTab(id as EManageCompanyOrdersTab);
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
    let params: TObject = {
      page,
      keywords,
      companyId,
    };

    const parsedOrderState =
      MANAGE_COMPANY_ORDERS_TAB_MAP[currentTab].join(',');
    params = { ...params, meta_orderState: parsedOrderState, currentTab };

    if (isReady) {
      dispatch(orderAsyncActions.queryCompanyOrders(params));
    }
  }, [companyId, currentTab, dispatch, isReady, keywords, page]);

  return (
    <div className={css.root}>
      <SearchOrderForm
        onSubmit={handleSubmitSearch}
        initialValues={{ keywords: keywords as string }}
      />
      <Tabs
        items={tabItems}
        onChange={handleTabChange}
        defaultActiveKey={'5'}
      />
    </div>
  );
};

export default CompanyOrdersTable;
