/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useField, useForm } from 'react-final-form-hooks';
import classNames from 'classnames';
import debounce from 'lodash/debounce';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import { FieldTextInputComponent } from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconEmpty from '@components/Icons/IconEmpty/IconEmpty';
import IconSearch from '@components/Icons/IconSearch/IconSearch';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import type { TTabsItem } from '@components/Tabs/Tabs';
import Tabs from '@components/Tabs/Tabs';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { partnerPaths } from '@src/paths';
import { Listing } from '@src/utils/data';
import { EMenuMealType, MENU_MEAL_TYPE_OPTIONS } from '@src/utils/enums';
import type { TListing } from '@src/utils/types';

import MenuCard from './components/MenuCard';
import { PartnerManageMenusThunks } from './PartnerManageMenus.slice';

import css from './PartnerManageMenusPage.module.scss';

const DEBOUNCE_TIME = 1000;

const NEED_HANDLE_MENU_TYPES = MENU_MEAL_TYPE_OPTIONS.slice(0, 3);
type TPartnerManageMenusPageProps = {};

const PartnerManageMenusPage: React.FC<TPartnerManageMenusPageProps> = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [searchTitle, setSearchTitle] = useState('');
  const [currentTab, setCurrentTab] = useState<string | EMenuMealType>(
    EMenuMealType.breakfast,
  );
  const menus = useAppSelector((state) => state.PartnerManageMenus.menus);
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
    setCurrentTab(params?.id?.toString());
  };

  const handleNavigateToCreateMenuPage = () => {
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
        <div>
          <RenderWhen condition={menusForTab.length > 0}>
            {menusForTab.map((m: TListing) => {
              return <MenuCard key={m?.id?.uuid} menu={m} />;
            })}
            <RenderWhen.False>
              <div className={css.emptyMenuList}>
                <IconEmpty variant="price" />
                <div>Bạn chưa có thực đơn nào</div>

                <Button
                  className={css.createMenuBtn}
                  onClick={handleNavigateToCreateMenuPage}>
                  Tạo menu
                </Button>
              </div>
            </RenderWhen.False>
          </RenderWhen>
        </div>
      );

      return {
        id: key,
        label: tabLabel,
        children: tabChildren,
      };
    });
  }, [currentTab, JSON.stringify(menus)]);

  const debounceFn = useCallback(
    debounce(
      // eslint-disable-next-line @typescript-eslint/no-shadow
      (searchTitle?: string) =>
        dispatch(
          PartnerManageMenusThunks.loadData({
            keywords: searchTitle || '',
          }),
        ),
      DEBOUNCE_TIME,
    ),
    [],
  );

  useEffect(() => {
    setSearchTitle(titleField.input.value);
  }, [titleField.input.value]);

  useEffect(() => {
    debounceFn(searchTitle);
  }, [searchTitle]);

  return (
    <div className={css.root}>
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
    </div>
  );
};

export default PartnerManageMenusPage;
