import Button, { InlineTextButton } from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import IconDelete from '@components/Icons/IconDelete/IconDelete';
import IconDuplicate from '@components/Icons/IconDuplicate/IconDuplicate';
import IconEdit from '@components/Icons/IconEdit/IconEdit';
import NamedLink from '@components/NamedLink/NamedLink';
import type { TSecondaryKeywordSearchFormValues } from '@components/SecondaryKeywordSearchForm/SecondaryKeywordSearchForm';
import SecondaryKeywordSearchForm from '@components/SecondaryKeywordSearchForm/SecondaryKeywordSearchForm';
import type { TColumn } from '@components/Table/Table';
import { TableForm } from '@components/Table/Table';
import type { TTabsItem } from '@components/Tabs/Tabs';
import Tabs from '@components/Tabs/Tabs';
import ToggleButton from '@components/ToggleButton/ToggleButton';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import type { TMenuMealTypeCount } from '@redux/slices/menus.slice';
import { menusSliceThunks } from '@redux/slices/menus.slice';
import { adminRoutes } from '@src/paths';
import { EMenuMealType, EMenuStatus, EMenuTypes } from '@utils/enums';
import type { TIntergrationListing } from '@utils/types';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { shallowEqual } from 'react-redux';

import css from './ManagePartnerMenus.module.scss';

type TManagePartnerMenusPageProps = {
  menuType: typeof EMenuTypes.cycleMenu | typeof EMenuTypes.fixedMenu;
};

const TABLE_COLUNMS: TColumn[] = [
  {
    key: 'title',
    label: 'Tên menu',
    render: ({ title }) => {
      return <div>{title}</div>;
    },
  },
  {
    key: 'applyDates',
    label: 'Thời gian áp dụng',
    render: ({ startDate, endDate }) => {
      return (
        <div>
          {startDate} - {endDate}
        </div>
      );
    },
  },
  {
    key: 'status',
    label: 'Trạng thái',
    render: ({ status, id, onToggleStatus }) => {
      return (
        <ToggleButton
          name={id}
          className={css.toggleButton}
          id={id}
          onClick={onToggleStatus}
          defaultValue={status === EMenuStatus.active}
        />
      );
    },
  },
  {
    key: 'actions',
    label: '',
    render: ({ id, restaurantId }) => {
      return (
        <div>
          <NamedLink
            path={`/admin/partner/${restaurantId}/settings/menu/${id}`}
            className={css.actionBtn}>
            <IconEdit />
          </NamedLink>
          <NamedLink
            path={`/admin/partner/${restaurantId}/settings/menu/create?duplicateId=${id}`}
            className={css.actionBtn}>
            <IconDuplicate />
          </NamedLink>
          <InlineTextButton
            type="button"
            onClick={() => {}}
            className={css.actionBtn}>
            <IconDelete />
          </InlineTextButton>
        </div>
      );
    },
  },
];

const parseEntitiesToTableData = (
  menues: TIntergrationListing[],
  extraData: any = {},
) => {
  return menues.map((menu) => {
    return {
      key: menu.id.uuid,
      data: {
        isDeleted: menu.attributes.metadata.isDeleted,
        title: menu.attributes.title,
        id: menu.id.uuid,
        status: menu.attributes.metadata.status,
        ...extraData,
      },
    };
  });
};

type TTabContentProps = {
  menuType: typeof EMenuTypes.cycleMenu | typeof EMenuTypes.fixedMenu;
  restaurantId: string;
  id: string;
  keywords: string;
};

const TabContent: React.FC<TTabContentProps> = (props) => {
  const { menuType, restaurantId, id: mealTypes, keywords } = props;
  const dispatch = useAppDispatch();
  const manageMenusPagination = useAppSelector(
    (state) => state.menus.manageMenusPagination,
    shallowEqual,
  );

  const queryMenusInProgress = useAppSelector(
    (state) => state.menus.queryMenusInProgress,
    shallowEqual,
  );
  const queryMenusError = useAppSelector(
    (state) => state.menus.queryMenusError,
    shallowEqual,
  );

  useEffect(() => {
    if (menuType && restaurantId && mealTypes)
      dispatch(
        menusSliceThunks.queryPartnerMenus({
          menuType,
          restaurantId,
          mealTypes,
          keywords,
        }),
      );
  }, [menuType, restaurantId, dispatch, mealTypes, keywords]);

  const menus = useAppSelector((state) => state.menus.menus, shallowEqual);
  const menuData = parseEntitiesToTableData(menus, { restaurantId });

  if (queryMenusError)
    return <ErrorMessage message={queryMenusError.message} />;

  return (
    <TableForm
      columns={TABLE_COLUNMS}
      data={menuData}
      paginationPath={`/admin/partner/${restaurantId}/settings/menu/fixed-menu`}
      pagination={manageMenusPagination}
      isLoading={queryMenusInProgress}
    />
  );
};

const ManagePartnerMenusPage: React.FC<TManagePartnerMenusPageProps> = (
  props,
) => {
  const { menuType } = props;
  const isFixedMenu = menuType === EMenuTypes.fixedMenu;
  const router = useRouter();
  const { restaurantId, keywords = '' } = router.query;
  const menuMealTypeCount = useAppSelector(
    (state) => state.menus.menuMealTypeCount,
    shallowEqual,
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(
      menusSliceThunks.getNumberOfMenuByMealType({
        restaurantId,
        menuType,
      }),
    );
  }, [restaurantId, menuType, dispatch]);

  const menuLabel: React.FC<TTabsItem & { isActive: boolean }> = (
    menuLabelProps,
  ) => {
    const { id, isActive } = menuLabelProps;
    return (
      <div className={css.menuContentTabLabel}>
        <div className={css.menuContentTabText}>
          <FormattedMessage id={`ManagePartnerMenusPage.${id}`} />
        </div>
        <div
          className={classNames(css.menuContentTabBadge, {
            [css.isActive]: isActive,
          })}>
          {menuMealTypeCount[id as keyof TMenuMealTypeCount]}
        </div>
      </div>
    );
  };

  const menuContent = [
    {
      id: EMenuMealType.breakfast as string,
      label: menuLabel,
      childrenFn: (childProps: TTabContentProps) => (
        <TabContent {...childProps} />
      ),
      childrenProps: {
        menuType,
        restaurantId,
        keywords,
      },
    },
    {
      id: EMenuMealType.lunch,
      label: menuLabel,
      childrenFn: (childProps: TTabContentProps) => (
        <TabContent {...childProps} />
      ),
      childrenProps: {
        menuType,
        restaurantId,
        keywords,
      },
    },
    {
      id: EMenuMealType.dinner,
      label: menuLabel,
      childrenFn: (childProps: TTabContentProps) => (
        <TabContent {...childProps} />
      ),
      childrenProps: {
        menuType,
        restaurantId,
        keywords,
      },
    },
    {
      id: EMenuMealType.snack,
      label: menuLabel,
      childrenFn: (childProps: any) => <TabContent {...childProps} />,
      childrenProps: {
        menuType,
        restaurantId,
        keywords,
      },
    },
  ];

  const onSubmit = ({
    keywords: newKeywords,
  }: TSecondaryKeywordSearchFormValues) => {
    router.push({
      pathname: isFixedMenu
        ? adminRoutes.ManagePartnerFixedMenus.path
        : adminRoutes.ManagePartnerCycleMenus.path,
      query: { ...router.query, keywords: newKeywords },
    });
  };

  return (
    <div className={css.root}>
      <div className={css.pageHeader}>
        <h1 className={css.title}>
          <FormattedMessage
            id={
              !isFixedMenu
                ? 'ManagePartnerMenusPage.cycleMenuTitle'
                : 'ManagePartnerMenusPage.fixedMenuTitle'
            }
          />
        </h1>
        <SecondaryKeywordSearchForm
          initialValues={{ keywords: keywords as string }}
          onSubmit={onSubmit}
        />
      </div>
      <NamedLink
        className={css.addButton}
        path={`/admin/partner/${restaurantId}/settings/menu/create`}>
        <Button type="button">Thêm thực đơn</Button>
      </NamedLink>
      <Tabs items={menuContent as any} />
    </div>
  );
};

export default ManagePartnerMenusPage;
