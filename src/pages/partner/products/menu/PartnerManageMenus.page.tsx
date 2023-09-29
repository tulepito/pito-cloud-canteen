/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useField, useForm } from 'react-final-form-hooks';
import classNames from 'classnames';
import debounce from 'lodash/debounce';

import Button from '@components/Button/Button';
import { FieldTextInputComponent } from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconFilter from '@components/Icons/IconFilter/IconFilter';
import IconSearch from '@components/Icons/IconSearch/IconSearch';
import type { TTabsItem } from '@components/Tabs/Tabs';
import Tabs from '@components/Tabs/Tabs';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { EMenuMealType, MENU_MEAL_TYPE_OPTIONS } from '@src/utils/enums';

import { PartnerManageMenusThunks } from './PartnerManageMenus.slice';

import css from './PartnerManageMenusPage.module.scss';

const DEBOUNCE_TIME = 1000;

const NEED_HANDLE_MENU_TYPES = MENU_MEAL_TYPE_OPTIONS.slice(0, 3);
type TPartnerManageMenusPageProps = {};

const PartnerManageMenusPage: React.FC<TPartnerManageMenusPageProps> = () => {
  const dispatch = useAppDispatch();
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

  const tabItems = useMemo(() => {
    return NEED_HANDLE_MENU_TYPES.map(({ key, label }) => {
      const isTabActive = currentTab === key;

      const countClasses = classNames(css.count, {
        [css.countActive]: isTabActive,
      });

      const tabLabel = (
        <div className={css.tabLabel}>
          {label}
          <span className={countClasses}>{0}</span>
        </div>
      );

      return {
        id: key,
        label: tabLabel,
        children: <div></div>,
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
      <Tabs items={tabItems} onChange={handleTabChanged} />
      <div className={css.searchFilterContainer}>
        <FieldTextInputComponent {...fieldTitleProps} />
        <Button variant="secondary">
          <IconFilter />
        </Button>
      </div>
    </div>
  );
};

export default PartnerManageMenusPage;
