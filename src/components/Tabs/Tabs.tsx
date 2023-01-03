import classNames from 'classnames';
import type { ReactNode } from 'react';
import React, { useState } from 'react';

import css from './Tabs.module.scss';

type TTabsItem = {
  label: string;
  key: string;
  children: ReactNode | string | number;
};

interface ITabsProps {
  defaultActiveKey?: string;
  items: TTabsItem[];
  onChange?: () => void;
  contentClassName?: string;
  headerClassName?: string;
}

const Tabs = (props: ITabsProps) => {
  const { defaultActiveKey, items, contentClassName, headerClassName } = props;
  const [activeTabKey, setActiveTabKey] = useState(defaultActiveKey || 1);

  const onChangeTab = (tabKey: number) => {
    setActiveTabKey(tabKey);
  };

  const tabHeader = items.map((item, index) => {
    const { label } = item;

    const isActiveClass = +activeTabKey === index + 1;

    const tabItemClasses = classNames(css.tabHeaderItem, {
      [css.tabActive]: isActiveClass,
    });
    return (
      <div
        key={`tab-${index}`}
        className={tabItemClasses}
        onClick={() => onChangeTab(index + 1)}>
        <span
          className={classNames(css.tabItemContent, {
            [css.tabActive]: isActiveClass,
          })}>
          {label}
        </span>
      </div>
    );
  });

  const tabContent = items[+activeTabKey - 1]?.children || '';

  // classes setup
  const headerClasses = classNames(css.tabHeaders, headerClassName);
  const contentClasses = classNames(css.tabPanel, contentClassName);
  return (
    <div className={css.root}>
      <div className={headerClasses}>{tabHeader}</div>
      <div className={contentClasses}>{tabContent}</div>
    </div>
  );
};

export default Tabs;
