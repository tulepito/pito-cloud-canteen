import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import classNames from 'classnames';

import { InlineTextButton } from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import IconDelete from '@components/Icons/IconDelete/IconDelete';
import IconDuplicate from '@components/Icons/IconDuplicate/IconDuplicate';
import IconEdit from '@components/Icons/IconEdit/IconEdit';
import IconSpinner from '@components/Icons/IconSpinner/IconSpinner';
import NamedLink from '@components/NamedLink/NamedLink';
import type { TColumn } from '@components/Table/Table';
import { TableForm } from '@components/Table/Table';
import type { TTabsItem } from '@components/Tabs/Tabs';
import Tabs from '@components/Tabs/Tabs';
import ToggleButton from '@components/ToggleButton/ToggleButton';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import type { TMenuMealTypeCount } from '@redux/slices/menus.slice';
import { menusSliceThunks } from '@redux/slices/menus.slice';
import { adminRoutes } from '@src/paths';
import { formatTimestamp } from '@utils/dates';
import type { EMenuType } from '@utils/enums';
import {
  EListingMenuStates,
  EListingStates,
  EMenuMealType,
} from '@utils/enums';
import type { TIntegrationListing } from '@utils/types';

import DisableMenuConfirmModal from '../DisableMenuConfirmModal/DisableMenuConfirmModal';
import { MENU_INFORMATION_TAB } from '../EditPartnerMenuWizard/utils';
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
          {listingState === EListingMenuStates.pendingRestaurantApproval && (
            <div className={css.draftBox}>
              <FormattedMessage id="ManagePartnersPage.pendingRestaurantApprovalState" />
            </div>
          )}
        </div>
      );
    },
  },
  {
    key: 'applyDates',
    label: 'Thời gian áp dụng',
    render: ({ startDate, endDate, isDeleted }) => {
      if (isDeleted) {
        return <></>;
      }

      return (
        <div className={css.row}>
          <div>
            {startDate && formatTimestamp(startDate)} -
            {endDate && formatTimestamp(endDate)}
          </div>
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
      isDeleted,
      onSetMenuToUpdate,
      toggleInProgress,
      onSetMenuToDisable,
    }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      if (isDeleted) {
        return <></>;
      }

      const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { checked } = e.target;

        if (!checked) {
          return onSetMenuToDisable();
        }
        const state = checked
          ? EListingStates.published
          : EListingStates.closed;
        onSetMenuToUpdate(state);
      };

      if (toggleInProgress) {
        return <IconSpinner className={css.loadingIcon} />;
      }

      return listingState === EListingStates.draft ||
        listingState === EListingMenuStates.pendingRestaurantApproval ? (
        <></>
      ) : (
        <ToggleButton
          name={id}
          className={css.toggleButton}
          id={id}
          onChange={onChange}
          uncontrolledValue={listingState === EListingStates.published}
        />
      );
    },
  },
  {
    key: 'actions',
    label: '',
    render: ({ id, restaurantId, onSetMenuToRemove, isDeleted }) => {
      if (isDeleted) {
        return <></>;
      }

      return (
        <div className="flex">
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
            onClick={onSetMenuToRemove}
            className={classNames(css.actionBtn, 'min-h-[unset]')}>
            <IconDelete />
          </InlineTextButton>
        </div>
      );
    },
  },
];

const parseEntitiesToTableData = (
  menues: TIntegrationListing[],
  {
    onSetMenuToRemove,
    onSetMenuToUpdate,
    onSetMenuToDisable,
    toggleMenuStateInProgressId,
  }: {
    onSetMenuToRemove: (menu: any) => void;
    onSetMenuToUpdate: (menu: any) => void;
    onSetMenuToDisable: (meny: any) => void;
    toggleMenuStateInProgressId: string | null;
  },
) => {
  return menues.map((menu) => {
    const { isDeleted, listingState, menuType, restaurantId } =
      menu.attributes.metadata;
    const { startDate, endDate, numberOfCycles, daysOfWeek } =
      menu.attributes.publicData;

    const handleUpdateMenu = (listingStateToUpdate: EListingStates) => {
      return onSetMenuToUpdate({
        id: menu.id.uuid,
        startDate,
        endDate,
        daysOfWeek,
        numberOfCycles,
        listingStateToUpdate,
      });
    };

    const handleSetMenuToRemove = () => {
      onSetMenuToRemove({ id: menu.id.uuid, title: menu.attributes.title });
    };

    const handleSetMenuToDisable = () => {
      onSetMenuToDisable({ id: menu.id.uuid, title: menu.attributes.title });
    };

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
        restaurantId,
        onSetMenuToRemove: handleSetMenuToRemove,
        onSetMenuToUpdate: handleUpdateMenu,
        onSetMenuToDisable: handleSetMenuToDisable,

        toggleInProgress: toggleMenuStateInProgressId === menu.id.uuid,
      },
    };
  });
};

type TTabContentProps = {
  menuType: typeof EMenuType.cycleMenu | typeof EMenuType.fixedMenu;
  restaurantId: string;
  id: string;
  keywords: string;
  page: string;
};

const TabContent: React.FC<TTabContentProps> = (props) => {
  const { menuType, restaurantId, id: mealType, keywords, page } = props;
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const [menuToRemove, setMenuToRemove] = useState<any>();
  const [menuToDisable, setMenuToDisable] = useState<any>();

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

  const onDisableMenu = async () => {
    const { error } = (await dispatch(
      menusSliceThunks.adminCloseMenu(menuToDisable.id),
    )) as any;
    if (!error) {
      setMenuToDisable(null);
    }
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

  const createOrUpdateMenuError = useAppSelector(
    (state) => state.menus.createOrUpdateMenuError,
    shallowEqual,
  );

  const publishMenuInProgressId = useAppSelector(
    (state) => state.menus.publishMenuInProgressId,
    shallowEqual,
  );

  const closeMenuInProgressId = useAppSelector(
    (state) => state.menus.closeMenuInProgressId,
    shallowEqual,
  );

  const onSetMenuToRemove = (menuData: any) => {
    setMenuToRemove(menuData);
  };

  const onSetMenuToDisable = (menuData: any) => {
    setMenuToDisable(menuData);
  };

  const onClearMenuToDisable = () => {
    setMenuToDisable(null);
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
      await dispatch(
        menusSliceThunks.queryPartnerMenus({
          menuType,
          restaurantId,
          page: 1,
          mealType,
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
    const { startDate, daysOfWeek, endDate, numberOfCycles } = values;

    const { error } = (await dispatch(
      menusSliceThunks.updatePartnerMenuListing({
        dataParams: {
          startDate,
          daysOfWeek,
          mealType,
          endDate,
          numberOfCycles,
          restaurantId,
          id: menuToUpdate?.id,
        },
        shouldPublish:
          menuToUpdate.listingStateToUpdate === EListingStates.published,
      }),
    )) as any;

    if (!error) {
      onClearMenuToUpdate();
      dispatch(
        menusSliceThunks.queryPartnerMenus({
          menuType,
          restaurantId,
          mealType,
          keywords,
          page,
        }),
      );
    }
  };

  const menuData = parseEntitiesToTableData(menus, {
    onSetMenuToRemove,
    onSetMenuToUpdate,
    onSetMenuToDisable,
    toggleMenuStateInProgressId:
      closeMenuInProgressId || publishMenuInProgressId,
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
      <DisableMenuConfirmModal
        content={intl.formatMessage(
          {
            id: 'ManagePartnerMenu.removeContent',
          },
          {
            menuTitle: (
              <div className={css.menuTitle}>
                {menuToRemove && menuToRemove.title}
              </div>
            ),
          },
        )}
        inProgressContent={intl.formatMessage(
          {
            id: 'ManagePartnerMenu.preventRemoveContent',
          },
          {
            link: (
              <NamedLink
                className={css.link}
                path={adminRoutes.ManageOrders.path}>
                <FormattedMessage id="ManagePartnerMenu.preventRemoveLink" />
              </NamedLink>
            ),
          },
        )}
        menuToDisable={menuToRemove}
        onClearMenuToDisable={onClearMenuToRemove}
        onDisabledMenu={onDeleteMenu}
        disableMenuInProgress={removeMenuInProgress}
        inProgressTitle={intl.formatMessage({
          id: 'ManagePartnerMenu.preventRemoveTitle',
        })}
        title={intl.formatMessage({
          id: 'ManagePartnerMenu.removeTitle',
        })}
        confirmLabel={intl.formatMessage({
          id: 'ManagePartnerMenu.removeMenu',
        })}
      />
      <DisableMenuConfirmModal
        content={intl.formatMessage(
          {
            id: 'ManagePartnerMenu.disableContent',
          },
          {
            menuTitle: (
              <div className={css.menuTitle}>
                {menuToDisable && menuToDisable.title}
              </div>
            ),
          },
        )}
        inProgressContent={intl.formatMessage(
          {
            id: 'ManagePartnerMenu.preventDisableContent',
          },
          {
            link: (
              <NamedLink
                className={css.link}
                path={adminRoutes.ManageOrders.path}>
                <FormattedMessage id="ManagePartnerMenu.preventDisableLink" />
              </NamedLink>
            ),
          },
        )}
        menuToDisable={menuToDisable}
        confirmLabel={intl.formatMessage({
          id: 'ManagePartnerMenu.disableMenu',
        })}
        onClearMenuToDisable={onClearMenuToDisable}
        onDisabledMenu={onDisableMenu}
        disableMenuInProgress={
          !!(closeMenuInProgressId || publishMenuInProgressId)
        }
        inProgressTitle={intl.formatMessage({
          id: 'ManagePartnerMenu.preventDisableTitle',
        })}
        title={intl.formatMessage({
          id: 'ManagePartnerMenu.disableTitle',
        })}
      />
      <UpdateMenuModal
        menuToUpdate={menuToUpdate}
        onClearMenuToUpdate={onClearMenuToUpdate}
        onUpdateMenuApplyTime={onUpdateMenuApplyTime}
        updateInProgress={createOrUpdateMenuInProgress}
        createOrUpdateMenuError={createOrUpdateMenuError}
      />
    </>
  );
};

type TManagePartnerMenusContent = {
  restaurantId: string;
  menuType: string;
  keywords: string;
  page: string;
  mealType: string;
};

const ManagePartnerMenusContent: React.FC<TManagePartnerMenusContent> = ({
  restaurantId,
  menuType,
  keywords,
  page,
  mealType,
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

  const menuLabel: React.FC<TTabsItem & { isActive: boolean }> = useCallback(
    (menuLabelProps) => {
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
    },
    [menuMealTypeCount],
  );
  const menuContent = useMemo(
    () => [
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
    ],
    [keywords, menuLabel, menuType, page, restaurantId],
  );

  const defaultIndex = useMemo(
    () => menuContent.findIndex((m) => m.id === mealType),
    [mealType, menuContent],
  );

  const defaultTabIndex = defaultIndex < 0 ? 0 : defaultIndex;

  return (
    <Tabs
      items={menuContent as any}
      defaultActiveKey={String(Number(defaultTabIndex) + 1)}
    />
  );
};

export default ManagePartnerMenusContent;
