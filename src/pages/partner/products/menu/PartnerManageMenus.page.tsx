/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useField, useForm } from 'react-final-form-hooks';
import classNames from 'classnames';
import debounce from 'lodash/debounce';
import { useRouter } from 'next/router';

import Alert, { EAlertPosition, EAlertType } from '@components/Alert/Alert';
import Button from '@components/Button/Button';
import { FieldTextInputComponent } from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconEmpty from '@components/Icons/IconEmpty/IconEmpty';
import IconSearch from '@components/Icons/IconSearch/IconSearch';
import LoadingModal from '@components/LoadingModal/LoadingModal';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import type { TTabsItem } from '@components/Tabs/Tabs';
import Tabs from '@components/Tabs/Tabs';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { partnerPaths } from '@src/paths';
import { Listing } from '@src/utils/data';
import { EMenuMealType } from '@src/utils/enums';
import { MENU_MEAL_TYPE_OPTIONS } from '@src/utils/options';
import type { TListing } from '@src/utils/types';

import MenuCard from './components/MenuCard';
import {
  PartnerManageMenusActions,
  PartnerManageMenusThunks,
} from './PartnerManageMenus.slice';

import css from './PartnerManageMenusPage.module.scss';

const DEBOUNCE_TIME = 1000;

const NEED_HANDLE_MENU_TYPES = MENU_MEAL_TYPE_OPTIONS.slice(0, 3);

type TPartnerManageMenusPageProps = {
  setShowAddMenuBtn: (value: boolean) => void;
};

const PartnerManageMenusPage: React.FC<TPartnerManageMenusPageProps> = ({
  setShowAddMenuBtn,
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const firstLoadControl = useBoolean(true);
  const confirmDeletedMenuControl = useBoolean();
  const [searchTitle, setSearchTitle] = useState('');
  const [currentTab, setCurrentTab] = useState<string | EMenuMealType>(
    EMenuMealType.breakfast,
  );
  const menus = useAppSelector((state) => state.PartnerManageMenus.menus);
  const fetchMenusInProgress = useAppSelector(
    (state) => state.PartnerManageMenus.fetchMenusInProgress,
  );
  const { form } = useForm({
    initialValues: {},
    onSubmit: () => {},
  });
  const titleField = useField(`title`, form);

  const fieldTitleProps = {
    id: 'PartnerManageMenusPage.search.title',
    name: 'title',
    placeholder: 'Search',
    meta: titleField.meta,
    input: titleField.input,
    className: css.titleFieldContainer,
    leftIcon: <IconSearch />,
  };

  const handleTabChanged = (params: TTabsItem) => {
    const tab = params?.id?.toString();
    setCurrentTab(tab);
  };

  const handleNavigateToCreateMenuPage = () => {
    dispatch(PartnerManageMenusActions.clearDraft());
    router.push(partnerPaths.CreateMenu);
  };

  const tabItems = useMemo(() => {
    return NEED_HANDLE_MENU_TYPES.map(({ key, label }) => {
      const isTabActive = currentTab === key;

      const countClasses = classNames(css.count, {
        [css.countActive]: isTabActive,
      });

      const menusForTab = menus.filter((m: TListing) => {
        const { mealType } = Listing(m).getPublicData();

        return mealType === key;
      });

      const tabLabel = (
        <div className={css.tabLabel}>
          {label}
          <span className={countClasses}>{menusForTab.length}</span>
        </div>
      );

      const tabChildren = (
        <RenderWhen condition={!fetchMenusInProgress}>
          <RenderWhen condition={menusForTab.length > 0}>
            {menusForTab.map((m: TListing) => {
              return (
                <MenuCard
                  key={m?.id?.uuid}
                  menu={m}
                  onDeleteMenuCompleted={confirmDeletedMenuControl.setTrue}
                />
              );
            })}
            <RenderWhen.False>
              <div className={css.emptyMenuList}>
                <RenderWhen condition={searchTitle?.length > 0}>
                  <div>Không tìm thấy thực đơn phù hợp</div>
                  <RenderWhen.False>
                    <IconEmpty variant="price" />
                    <div>Bạn chưa có thực đơn nào</div>
                    <Button
                      className={css.createMenuBtn}
                      onClick={handleNavigateToCreateMenuPage}>
                      Tạo menu
                    </Button>
                  </RenderWhen.False>
                </RenderWhen>
              </div>
            </RenderWhen.False>
          </RenderWhen>
        </RenderWhen>
      );

      return {
        id: key,
        label: tabLabel,
        children: tabChildren,
      };
    });
  }, [fetchMenusInProgress, currentTab, JSON.stringify(menus)]);

  const debounceFn = useCallback(
    debounce(
      // eslint-disable-next-line @typescript-eslint/no-shadow
      (searchTitle?: string) =>
        dispatch(
          PartnerManageMenusThunks.loadData({
            keywords: searchTitle || '',
          }),
        ),
      firstLoadControl.value ? 0 : DEBOUNCE_TIME,
    ),
    [firstLoadControl.value],
  );

  useEffect(() => {
    const menusForTab = menus.filter((m: TListing) => {
      const { mealType } = Listing(m).getPublicData();

      return mealType === currentTab;
    });
    setShowAddMenuBtn(menusForTab.length > 0);
  }, [currentTab, JSON.stringify(menus)]);
  useEffect(() => {
    setSearchTitle(titleField.input.value);
  }, [titleField.input.value]);
  useEffect(() => {
    debounceFn(searchTitle);
  }, [searchTitle]);
  useEffect(() => {
    firstLoadControl.setFalse();
  }, []);

  return (
    <div className={css.root}>
      <LoadingModal isOpen={fetchMenusInProgress} />
      <Tabs
        items={tabItems}
        onChange={handleTabChanged}
        actionsClassName={css.tabAction}
        actionsComponent={
          <div className={css.searchFilterContainer}>
            <FieldTextInputComponent {...fieldTitleProps} />
          </div>
        }
      />

      <Alert
        message="Xóa menu thành công"
        isOpen={confirmDeletedMenuControl.value}
        autoClose
        className={css.confirmDeletedMenu}
        openClassName={css.confirmDeletedMenuOpen}
        onClose={confirmDeletedMenuControl.setFalse}
        type={EAlertType.success}
        hasCloseButton={false}
        position={EAlertPosition.bottomLeft}
      />
    </div>
  );
};

export default PartnerManageMenusPage;
