import { InlineTextButton } from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import IconDelete from '@components/Icons/IconDelete/IconDelete';
import IconDuplicate from '@components/Icons/IconDuplicate/IconDuplicate';
import IconEdit from '@components/Icons/IconEdit/IconEdit';
import NamedLink from '@components/NamedLink/NamedLink';
import type { TColumn } from '@components/Table/Table';
import { TableForm } from '@components/Table/Table';
import type { TTabsItem } from '@components/Tabs/Tabs';
import Tabs from '@components/Tabs/Tabs';
import ToggleButton from '@components/ToggleButton/ToggleButton';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import type { TMenuMealTypeCount } from '@redux/slices/menus.slice';
import { menusSliceThunks } from '@redux/slices/menus.slice';
import { parseTimestampToFormat } from '@utils/dates';
import { EListingStates, EMenuMealType, EMenuTypes } from '@utils/enums';
import type { TIntegrationListing } from '@utils/types';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { shallowEqual } from 'react-redux';

import {
  createUpdateMenuApplyTimeValues,
  MENU_INFORMATION_TAB,
} from '../EditPartnerMenuWizard/utils';
import RemoveMenuConfirmModal from '../RemoveMenuConfirmModal/RemoveMenuConfirmModal';
import UpdateMenuModal from '../UpdateMenuModal/UpdateMenuModal';
import type { TUpdateMenuModalFormValues } from '../UpdateMenuModal/UpdateMenuModalForm';
import css from './ManagePartnerMenusContent.module.scss';

const TABLE_COLUNMS: TColumn[] = [
  {
    key: 'title',
    label: 'Tên menu',
    render: ({ title, listingState, isDeleted }) => {
      if (isDeleted) {
        return (
          <div className={css.deletedMenu}>
            <FormattedMessage id="ManagePartnerMenus.deletedMenu" />
          </div>
        );
      }
      return (
        <div className={css.row}>
          {title}
          {listingState === EListingStates.draft && (
            <div className={css.draftBox}>
              <FormattedMessage id="ManagePartnersPage.draftState" />
            </div>
          )}
        </div>
      );
    },
  },
  {
    key: 'applyDates',
    label: 'Thời gian áp dụng',
    render: ({ startDate, endDate, isDeleted, menuType }) => {
      if (isDeleted) {
        return <></>;
      }
      return (
        <div className={css.row}>
          {menuType === EMenuTypes.cycleMenu ? (
            <div>
              {parseTimestampToFormat(startDate)} -
              {parseTimestampToFormat(endDate)}
            </div>
          ) : (
            <div>
              <span>Từ </span>
              {parseTimestampToFormat(startDate)}
            </div>
          )}
        </div>
      );
    },
  },
  {
    key: 'status',
    label: 'Trạng thái',
    render: ({
      listingState,
      id,
      onToggleStatus,
      isDeleted,
      startDate,
      endDate,
      daysOfWeek,
      numberOfCycles,
      menuType,
      onSetMenuToUpdate,
    }) => {
      if (isDeleted) {
        return <></>;
      }
      const onClick = (checked: boolean) => {
        const newStatus = checked
          ? EListingStates.published
          : EListingStates.closed;

        onToggleStatus(id, newStatus);
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        checked &&
          onSetMenuToUpdate({
            id,
            startDate,
            endDate,
            daysOfWeek,
            numberOfCycles,
            menuType,
          });
      };

      return listingState === EListingStates.draft ? (
        <></>
      ) : (
        <ToggleButton
          name={id}
          className={css.toggleButton}
          id={id}
          onClick={onClick}
          defaultValue={listingState === EListingStates.published}
        />
      );
    },
  },
  {
    key: 'actions',
    label: '',
    render: ({ id, restaurantId, onSetMenuToRemove, title, isDeleted }) => {
      if (isDeleted) {
        return <></>;
      }
      return (
        <div>
          <NamedLink
            path={`/admin/partner/${restaurantId}/settings/menu/${id}`}
            className={css.actionBtn}>
            <IconEdit />
          </NamedLink>
          <NamedLink
            path={`/admin/partner/${restaurantId}/settings/menu/create?duplicateId=${id}&tab=${MENU_INFORMATION_TAB}`}
            className={css.actionBtn}>
            <IconDuplicate />
          </NamedLink>
          <InlineTextButton
            type="button"
            onClick={onSetMenuToRemove({ id, title })}
            className={css.actionBtn}>
            <IconDelete />
          </InlineTextButton>
        </div>
      );
    },
  },
];

const parseEntitiesToTableData = (
  menues: TIntegrationListing[],
  extraData: any = {},
) => {
  return menues.map((menu) => {
    const { isDeleted, listingState, menuType } = menu.attributes.metadata;
    const { startDate, endDate, numberOfCycles, daysOfWeek } =
      menu.attributes.publicData;

    return {
      key: menu.id.uuid,
      data: {
        menuType,
        isDeleted,
        title: menu.attributes.title,
        id: menu.id.uuid,
        listingState,
        startDate,
        endDate,
        numberOfCycles,
        daysOfWeek,
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
  page: string;
};

const TabContent: React.FC<TTabContentProps> = (props) => {
  const { menuType, restaurantId, id: mealType, keywords, page } = props;
  const dispatch = useAppDispatch();
  const [menuToRemove, setMenuToRemove] = useState<any>();
  const [menuToUpdate, setMenuToUpdate] = useState<any>();

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
    if (menuType && restaurantId && mealType)
      dispatch(
        menusSliceThunks.queryPartnerMenus({
          menuType,
          restaurantId,
          mealType,
          keywords,
          page,
        }),
      );
  }, [menuType, restaurantId, dispatch, mealType, keywords, page]);

  const onToggleStatus = (id: string, state: string) => {
    dispatch(
      menusSliceThunks.togglePartnerMenuListing({
        id,
        metadata: {
          listingState: state,
        },
      }),
    );
  };

  const menus = useAppSelector((state) => state.menus.menus, shallowEqual);
  const removeMenuInProgress = useAppSelector(
    (state) => state.menus.removeMenuInProgress,
    shallowEqual,
  );

  const createOrUpdateMenuInProgress = useAppSelector(
    (state) => state.menus.createOrUpdateMenuInProgress,
    shallowEqual,
  );

  const onSetMenuToRemove = (menuData: any) => () => {
    setMenuToRemove(menuData);
  };

  const onClearMenuToRemove = () => {
    setMenuToRemove(null);
  };

  const onSetMenuToUpdate = (menuData: any) => {
    setMenuToUpdate(menuData);
  };

  const onClearMenuToUpdate = () => {
    setMenuToUpdate(null);
  };

  const onDeleteMenu = async () => {
    if (!menuToRemove) return;
    const { id } = menuToRemove;
    const { error } = (await dispatch(
      menusSliceThunks.deletePartnerMenu({ id }),
    )) as any;

    if (!error) {
      setMenuToRemove(null);
      dispatch(
        menusSliceThunks.queryPartnerMenus({
          menuType,
          restaurantId,
          page: 1,
        }),
      );
      dispatch(
        menusSliceThunks.getNumberOfMenuByMealType({
          restaurantId,
          menuType,
        }),
      );
    }
  };

  const onUpdateMenuApplyTime = async (values: TUpdateMenuModalFormValues) => {
    const { error } = (await dispatch(
      menusSliceThunks.updatePartnerMenuListing(
        createUpdateMenuApplyTimeValues({ ...menuToUpdate, ...values }),
      ),
    )) as any;
    if (!error) {
      onClearMenuToUpdate();
      dispatch(
        menusSliceThunks.queryPartnerMenus({
          menuType,
          restaurantId,
          mealType,
          keywords,
        }),
      );
    }
  };

  const menuData = parseEntitiesToTableData(menus, {
    restaurantId,
    onToggleStatus,
    onSetMenuToRemove,
    onSetMenuToUpdate,
  });

  if (queryMenusError)
    return <ErrorMessage message={queryMenusError.message} />;

  return (
    <>
      <TableForm
        columns={TABLE_COLUNMS}
        data={menuData}
        paginationPath={`/admin/partner/${restaurantId}/settings/menu/fixed-menu`}
        pagination={manageMenusPagination}
        isLoading={queryMenusInProgress}
      />
      <RemoveMenuConfirmModal
        menuToRemove={menuToRemove}
        onClearMenuToRemove={onClearMenuToRemove}
        onDeleteMenu={onDeleteMenu}
        removeMenuInProgress={removeMenuInProgress}
      />
      <UpdateMenuModal
        menuToUpdate={menuToUpdate}
        onClearMenuToUpdate={onClearMenuToUpdate}
        onUpdateMenuApplyTime={onUpdateMenuApplyTime}
        updateInProgress={createOrUpdateMenuInProgress}
      />
    </>
  );
};

type TManagePartnerMenusContent = {
  restaurantId: string;
  menuType: string;
  keywords: string;
  page: string;
};

const ManagePartnerMenusContent: React.FC<TManagePartnerMenusContent> = ({
  restaurantId,
  menuType,
  keywords,
  page,
}) => {
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
        page,
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
        page,
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
        page,
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
        page,
      },
    },
  ];
  return <Tabs items={menuContent as any} />;
};

export default ManagePartnerMenusContent;
