import classNames from 'classnames';
import type { ReactNode } from 'react';
import React, { useState } from 'react';

import css from './Tabs.module.scss';

export type TTabsItem = {
  label: string;
  key: string;
  children?: ReactNode | string | number;
  childrenFn?: (e: any) => ReactNode;
  childrenProps?: any;
};
interface ITabsProps {
  defaultActiveKey?: string;
  items: TTabsItem[];
  onChange?: () => void;
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

  const tabContent = items[+activeTabKey - 1]?.childrenFn
    ? items[+activeTabKey - 1]?.childrenFn(
        items[+activeTabKey - 1]?.childrenProps,
      )
    : items[+activeTabKey - 1]?.children || '';

  // classes setup
  const headerClassName = classNames(css.tabHeaders);
  const contentClassName = classNames(css.tabPanel);
  return (
    <div>
      <div className={headerClassName}>{tabHeader}</div>
      <div className={contentClassName}>{tabContent}</div>
    </div>
  );
};

export default Tabs;
