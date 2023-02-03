import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import { TableForm } from '@components/Table/Table';
import type { TTabsItem } from '@components/Tabs/Tabs';
import Tabs from '@components/Tabs/Tabs';
import { getCompanyIdFromBookerUser } from '@helpers/company';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { currentUserSelector } from '@redux/slices/user.slice';
import { companyPaths } from '@src/paths';
import { EOrderStates } from '@utils/enums';
import type { TObject } from '@utils/types';
import classNames from 'classnames';
import { useRouter } from 'next-router-mock';
import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import { parseEntitiesToTableData } from '../helpers/parseEntitiesToTableData';
import { ManageCompanyOrdersPageTabIds } from '../utils/constant';
import css from './CompanyOrdersTable.module.scss';
import { CompanyOrdersTableColumns } from './CompanyOrdersTableColumns';

const tabLabelMap = {
  [EOrderStates.picking]: 'ManageCompanyOrdersPage.tabSection.pickingLabel',
  [EOrderStates.completed]: 'ManageCompanyOrdersPage.tabSection.completedLabel',
  [EOrderStates.isNew]: 'ManageCompanyOrdersPage.tabSection.draftLabel',
  [EOrderStates.canceled]: 'ManageCompanyOrdersPage.tabSection.canceledLabel',
  all: 'ManageCompanyOrdersPage.tabSection.allLabel',
};

const prepareTabItems = ({ intl, currentTab, tableData }: any) => {
  const {
    queryOrderInProgress,
    queryOrderError,
    orders = [],
    manageOrdersPagination,
    totalItemMap = {},
    // eslint-disable-next-line react-hooks/rules-of-hooks
  } = useAppSelector((state) => state.Order, shallowEqual);

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
  const [currentTab, setCurrentTab] = useState<string>(
    ManageCompanyOrdersPageTabIds[4],
  );
  const { query, isReady } = useRouter();
  const dispatch = useAppDispatch();
  const {
    orders = [],
    // eslint-disable-next-line react-hooks/rules-of-hooks
  } = useAppSelector((state) => state.Order, shallowEqual);
  const currentUser = useAppSelector(currentUserSelector);

  const { page = 1, keywords = '' } = query;

  const companyId = getCompanyIdFromBookerUser(currentUser);
  const tableData = parseEntitiesToTableData(orders, Number(page));
  const tabItems = prepareTabItems({
    intl,
    currentTab,
    tableData,
  });

  const handleTabChange = ({ id }: TTabsItem) => {
    setCurrentTab(id as string);
  };

  useEffect(() => {
    let params: TObject = {
      page,
      keywords,
      companyId,
    };

    if (currentTab !== 'all') {
      params = { ...params, meta_orderState: currentTab };
    }

    if (isReady) {
      dispatch(orderAsyncActions.queryCompanyOrders(params));
    }
  }, [companyId, currentTab, dispatch, isReady, keywords, page]);

  return (
    <div className={css.root}>
      <Tabs
        items={tabItems}
        onChange={handleTabChange}
        defaultActiveKey={'5'}
      />
    </div>
  );
};

export default CompanyOrdersTable;
