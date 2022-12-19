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
}

const Tabs = (props: ITabsProps) => {
  const { defaultActiveKey, items } = props;
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

  const tabContentIdx = items[+activeTabKey - 1].children;
  return (
    <div>
      <div className={css.tabHeaders}>{tabHeader}</div>
      <div className={css.tabPanel}>{tabContentIdx}</div>
    </div>
  );
};

export default Tabs;
