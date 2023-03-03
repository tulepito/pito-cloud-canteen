import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
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
import { formatTimestamp } from '@utils/dates';
import type { EMenuTypes } from '@utils/enums';
import { EListingStates, EMenuMealType } from '@utils/enums';
import type { TIntegrationListing } from '@utils/types';

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
      onToggleStatus,
      toggleInProgress,
    }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      if (isDeleted) {
        return <></>;
      }
      const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { checked } = e.target;
        if (!checked) {
          return onToggleStatus(id, EListingStates.closed);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        const state = checked
          ? EListingStates.published
          : EListingStates.closed;
        onSetMenuToUpdate(state);
      };

      if (toggleInProgress) {
        return <IconSpinner className={css.loadingIcon} />;
      }
      return listingState === EListingStates.draft ? (
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
            onClick={onSetMenuToRemove}
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
  {
    onSetMenuToRemove,
    onSetMenuToUpdate,
    onToggleStatus,
    toggleMenuStateInProgressId,
  }: {
    onSetMenuToRemove: (menu: any) => void;
    onSetMenuToUpdate: (menu: any) => void;
    onToggleStatus: (id: string, state: EListingStates) => void;
    toggleMenuStateInProgressId: string | null;
  },
) => {
  return menues.map((menu) => {
    const {
      isDeleted,
      listingState,
      menuType,
      monFoodIdList,
      tueFoodIdList,
      wedFoodIdList,
      thuFoodIdList,
      friFoodIdList,
      satFoodIdList,
      sunFoodIdList,
      restaurantId,
    } = menu.attributes.metadata;
    const {
      startDate,
      endDate,
      numberOfCycles,
      daysOfWeek,
      foodsByDate,
      monAverageFoodPrice,
      tueAverageFoodPrice,
      wedAverageFoodPrice,
      thuAverageFoodPrice,
      friAverageFoodPrice,
      satAverageFoodPrice,
      sunAverageFoodPrice,
      mealType,
    } = menu.attributes.publicData;

    const handleUpdateMenu = (listingStateToUpdate: EListingStates) => {
      return onSetMenuToUpdate({
        id: menu.id.uuid,
        startDate,
        endDate,
        daysOfWeek,
        numberOfCycles,
        menuType,
        monFoodIdList,
        tueFoodIdList,
        wedFoodIdList,
        thuFoodIdList,
        friFoodIdList,
        satFoodIdList,
        sunFoodIdList,
        monAverageFoodPrice,
        tueAverageFoodPrice,
        wedAverageFoodPrice,
        thuAverageFoodPrice,
        friAverageFoodPrice,
        satAverageFoodPrice,
        sunAverageFoodPrice,
        foodsByDate,
        restaurantId,
        mealType,
        listingState: listingStateToUpdate,
      });
    };

    const handleSetMenuToRemove = () => {
      onSetMenuToRemove({ id: menu.id.uuid, title: menu.attributes.title });
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
        onToggleStatus,
        toggleInProgress: toggleMenuStateInProgressId === menu.id.uuid,
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

  const onToggleStatus = (id: string, listingState: EListingStates) => {
    dispatch(
      menusSliceThunks.toggleMenuState({
        id,
        listingState,
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

  const createOrUpdateMenuError = useAppSelector(
    (state) => state.menus.createOrUpdateMenuError,
    shallowEqual,
  );

  const toggleMenuStateInProgressId = useAppSelector(
    (state) => state.menus.toggleMenuStateInProgressId,
    shallowEqual,
  );

  const onSetMenuToRemove = (menuData: any) => {
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
    const { error } = (await dispatch(
      menusSliceThunks.updatePartnerMenuListing(
        createUpdateMenuApplyTimeValues({ ...menuToUpdate, ...values }),
      ),
    )) as any;

    if (!error) {
      await onToggleStatus(menuToUpdate.id, EListingStates.published);
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
    onToggleStatus,
    toggleMenuStateInProgressId,
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
