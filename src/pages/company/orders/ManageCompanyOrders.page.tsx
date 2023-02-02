import Badge, { EBadgeType } from '@components/Badge/Badge';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import NamedLink from '@components/NamedLink/NamedLink';
import type { TColumn } from '@components/Table/Table';
import { TableForm } from '@components/Table/Table';
import type { TTabsItem } from '@components/Tabs/Tabs';
import Tabs from '@components/Tabs/Tabs';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  BADGE_CLASSNAME_BASE_ON_ORDER_STATE,
  BADGE_TYPE_BASE_ON_ORDER_STATE,
} from '@pages/admin/order/ManageOrders.page';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { currentUserSelector } from '@redux/slices/user.slice';
import { adminRoutes, companyPaths } from '@src/paths';
import { UserPermission } from '@src/types/UserPermission';
import { CURRENT_USER } from '@utils/data';
import { parseTimestampToFormat } from '@utils/dates';
import {
  EOrderStates,
  getLabelByKey,
  ORDER_STATES_OPTIONS,
} from '@utils/enums';
import type { TIntegrationOrderListing, TObject } from '@utils/types';
import classNames from 'classnames';
import uniq from 'lodash/uniq';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import css from './ManageCompanyOrdersPage.module.scss';
import { ManageCompanyOrdersPageTabIds } from './utils/constant';

type TManageCompanyOrdersPageProps = {};

const tabLabelMap = {
  [EOrderStates.picking]: 'ManageCompanyOrdersPage.tabSection.pickingLabel',
  [EOrderStates.completed]: 'ManageCompanyOrdersPage.tabSection.completedLabel',
  [EOrderStates.isNew]: 'ManageCompanyOrdersPage.tabSection.draftLabel',
  [EOrderStates.canceled]: 'ManageCompanyOrdersPage.tabSection.canceledLabel',
  all: 'ManageCompanyOrdersPage.tabSection.allLabel',
};

const TABLE_COLUMNS: TColumn[] = [
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
  },
  {
    key: 'startDate',
    label: 'Thời gian',
    render: (data: any) => {
      return (
        <div className={css.rowText}>
          <div className={css.deliveryHour}>{data.deliveryHour}</div>
          {data.startDate} - {data.endDate}
        </div>
      );
    },
  },
  {
    key: 'orderName',
    label: 'Loại đơn',
    render: () => {
      return <div className={css.orderName}>PITO Cloud Canteen</div>;
    },
  },

  {
    key: 'restaurantName',
    label: 'Đơn vị phục vụ',
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
    key: 'address',
    label: 'Địa điểm giao hàng',
    render: (data: any) => {
      return <div className={css.locationRow}>{data.location}</div>;
    },
  },
  {
    key: 'totalWithVAT',
    label: 'Giá trị đơn hàng',
    render: () => {
      return <></>;
    },
  },
  {
    key: 'state',
    label: 'Trạng thái',
    render: ({ state }: { state: EOrderStates }) => {
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
  },
];

const parseEntitiesToTableData = (
  orders: TIntegrationOrderListing[],
  page: number,
) => {
  return orders.map((entity, index) => {
    const { orderDetail = {} } = entity?.attributes?.metadata || {};

    return {
      key: entity.id.uuid,
      data: {
        id: entity.id.uuid,
        title: entity.attributes.title,
        orderNumber: (page - 1) * 10 + index + 1,
        location:
          entity?.attributes?.metadata?.generalInfo?.deliveryAddress?.address,
        startDate: parseTimestampToFormat(
          entity?.attributes?.metadata?.generalInfo?.startDate,
        ),
        endDate: parseTimestampToFormat(
          entity?.attributes?.metadata?.generalInfo?.endDate,
        ),
        state: entity.attributes.metadata?.orderState || EOrderStates.isNew,
        orderId: entity?.id?.uuid,
        restaurants: uniq(
          Object.keys(orderDetail).map((key) => {
            return orderDetail[key]?.restaurant?.restaurantName;
          }),
        ),
        orderDetail: entity.attributes.metadata?.orderDetail,
        orderName: entity.attributes.publicData.orderName,
        deliveryHour: entity.attributes.metadata?.generalInfo?.deliveryHour,
      },
    };
  });
};

const ManageCompanyOrdersPage: React.FC<TManageCompanyOrdersPageProps> = () => {
  const intl = useIntl();
  const [currentTab, setCurrentTab] = useState<string>(
    ManageCompanyOrdersPageTabIds[4],
  );

  const { query, isReady } = useRouter();
  const dispatch = useAppDispatch();
  const {
    queryOrderInProgress,
    queryOrderError,
    orders = [],
    manageOrdersPagination,
    totalItemMap = {},
  } = useAppSelector((state) => state.Order, shallowEqual);

  const { page = 1, keywords = '' } = query;

  const currentUser = useAppSelector(currentUserSelector);

  const companies = CURRENT_USER(currentUser).getMetadata()?.company || {};
  const company = Object.entries(companies).find((entry) => {
    const [, permissionData] = entry;

    return (permissionData as TObject).permission === UserPermission.BOOKER;
  });
  const companyId = company ? company[0] : '';

  const tableData = parseEntitiesToTableData(orders, Number(page));
  const tabItems = Object.entries(tabLabelMap).map(([key, id]) => {
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
          columns={TABLE_COLUMNS}
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

  const sectionTitle = intl.formatMessage({
    id: 'ManageCompanyOrdersPage.titleSection.title',
  });
  const sectionTitlePITOPhoneNumber = (
    <span className={css.phoneNumber}>
      {intl.formatMessage({
        id: 'ManageCompanyOrdersPage.titleSection.phoneNumber',
      })}
    </span>
  );
  const sectionTitleSubtitle = intl.formatMessage(
    {
      id: 'ManageCompanyOrdersPage.titleSection.subtitle',
    },
    { phoneNumber: sectionTitlePITOPhoneNumber },
  );

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
      <section className={css.titleSection}>
        <div className={css.title}>{sectionTitle}</div>
        <div className={css.subtitle}>{sectionTitleSubtitle}</div>
      </section>
      <Tabs
        items={tabItems}
        onChange={handleTabChange}
        defaultActiveKey={'5'}
      />
    </div>
  );
};

export default ManageCompanyOrdersPage;
